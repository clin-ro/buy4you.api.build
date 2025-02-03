import { QuotationsService } from '@/resources/quotations/quotations.service';
import { Order, OrderStatus } from '@/schemas/mongo/order.schema';
import { Quotation } from '@/schemas/mongo/quotation.schema';
import { SupplierCompany } from '@/schemas/mongo/supplier-company.schema';
import { SubmitQuoteDto } from '@/swagger/supplier.dto';
import { MinioService } from '@/utils/minio/minio.service';
import { MongooseUtils } from '@/utils/mongoose/id.utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';

@Injectable()
export class SupplierService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Quotation.name) private quotationModel: Model<Quotation>,
        @InjectModel(SupplierCompany.name) private supplierCompanyModel: Model<SupplierCompany>,
        private readonly minioService: MinioService,
        private readonly quotationsService: QuotationsService
    ) { }

    async getQuotations(status?: string, page = 1, limit = 10) {
        const query = status ? { status } : {};
        const skip = (page - 1) * limit;

        const [quotations, total] = await Promise.all([
            this.quotationModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.quotationModel.countDocuments(query).exec(),
        ]);

        return {
            data: quotations,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getQuotationByToken(token: string) {
        const quotation = await this.quotationModel
            .findOne({ 'supplierQuotes.submissionToken': token })
            .exec();

        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        return quotation;
    }

    async submitQuote(profileId: string, quotationId: string, submitQuoteDto: SubmitQuoteDto, fileUrl: string) {
        const totalPrice = submitQuoteDto.items.reduce((sum, item) => sum + item.totalPrice, 0);
        return this.quotationsService.addSupplierQuote(quotationId, {
            supplierId: MongooseUtils.toObjectId(profileId),
            items: submitQuoteDto.items.map(item => ({
                orderItemId: item.name,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                notes: item.description,
                totalPrice: item.totalPrice
            })),
            totalPrice,
            currency: 'USD',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            deliveryDate: submitQuoteDto.deliveryDate,
            notes: submitQuoteDto.notes,
            fileUrl
        });
    }

    async getOrders(status?: string, page = 1, limit = 10) {
        const query = status ? { status } : {};
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.orderModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.orderModel.countDocuments(query).exec(),
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getOrder(orderId: Types.ObjectId) {
        const order = await this.orderModel.findById(orderId).exec();

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async updateDeliveryStatus(orderId: Types.ObjectId, updateDeliveryStatusDto: UpdateDeliveryStatusDto) {
        const order = await this.getOrder(orderId);

        // Update delivered quantities
        updateDeliveryStatusDto.deliveredItems.forEach(({ itemIndex, quantity }) => {
            if (order.items[itemIndex]) {
                order.items[itemIndex].deliveredQuantity = (order.items[itemIndex].deliveredQuantity || 0) + quantity;
                order.items[itemIndex].lastDeliveryDate = updateDeliveryStatusDto.date;
            }
        });

        // Add delivery record
        order.deliveryRecords.push({
            date: updateDeliveryStatusDto.date,
            deliveredItems: updateDeliveryStatusDto.deliveredItems,
            notes: updateDeliveryStatusDto.notes,
            isPartial: updateDeliveryStatusDto.isPartial ?? false,
        });

        // Update order status
        const allItemsDelivered = order.items.every(
            (item) => (item.deliveredQuantity || 0) >= (item.quantity || 0)
        );

        if (allItemsDelivered) {
            order.status = OrderStatus.DELIVERED;
        } else if (updateDeliveryStatusDto.isPartial) {
            order.status = OrderStatus.PARTIALLY_DELIVERED;
        }

        await order.save();

        // Update supplier performance metrics
        const supplier = await this.supplierCompanyModel.findById(order.selectedQuotationId);
        if (supplier) {
            const updateData: any = {
                $inc: {
                    'performance.completedOrders': allItemsDelivered ? 1 : 0,
                    'performance.partialDeliveries': updateDeliveryStatusDto.isPartial ? 1 : 0,
                },
            };

            const deliveryDate = new Date(updateDeliveryStatusDto.date);
            if (deliveryDate > order.requiredDeliveryDate) {
                updateData.$inc['performance.lateDeliveries'] = 1;
            } else {
                updateData.$inc['performance.onTimeDeliveries'] = 1;
            }

            await this.supplierCompanyModel.updateOne(
                { _id: supplier._id },
                updateData
            );
        }

        return order;
    }

    async getPerformanceMetrics() {
        const supplier = await this.supplierCompanyModel
            .findOne()
            .select('performance rating')
            .exec();

        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        return {
            performance: supplier.performance,
            rating: supplier.rating,
        };
    }
} 