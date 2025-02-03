import { DeliveryRecord, Order, OrderStatus } from '@/schemas/mongo/order.schema';
import { Profile } from '@/schemas/mongo/profile.schema';
import { SupplierCompany } from '@/schemas/mongo/supplier-company.schema';
import { MailerService } from '@/utils/mailer/mailer.service';
import { StripeService } from '@/utils/stripe/stripe.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(SupplierCompany.name) private supplierCompanyModel: Model<SupplierCompany>,
        @InjectModel(Profile.name) private profileModel: Model<Profile>,
        private readonly mailerService: MailerService,
        private readonly stripeService: StripeService
    ) { }

    async findAll(profileId: string) {
        return this.orderModel
            .find({ profileId: new Types.ObjectId(profileId) })
            .sort({ createdAt: -1 })
            .populate('jobSite');
    }

    async search(profileId: string, term?: string, status?: string, startDate?: Date, endDate?: Date) {
        let query = this.orderModel.find({ profileId: new Types.ObjectId(profileId) });

        if (term) {
            query = query.or([
                { name: new RegExp(term, 'i') },
                { jobSiteName: new RegExp(term, 'i') },
            ]);
        }

        if (status && status !== 'all') {
            query = query.where('status').equals(status);
        }

        if (startDate && endDate) {
            query = query
                .where('createdAt')
                .gte(startDate.getTime())
                .lte(endDate.getTime());
        }

        return query.exec();
    }

    async getQuickLookups(startDate?: Date, endDate?: Date) {
        const dateMatch: Record<string, any> = {};
        if (startDate && endDate) {
            dateMatch['createdAt'] = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        const stats = await this.orderModel.aggregate([
            {
                $match: dateMatch,
            },
            {
                $facet: {
                    totalOrders: [{ $count: 'count' }],
                    statusCounts: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    totalRevenue: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $ifNull: ['$amount', 0] } },
                            },
                        },
                    ],
                },
            },
        ]);

        const result = stats[0];
        const totalOrders = result?.totalOrders?.[0]?.count || 0;
        const statusMap = result.statusCounts.reduce(
            (acc: any, { _id, count }: any) => ({
                ...acc,
                [_id]: count,
            }),
            {},
        );
        const totalRevenue = result?.totalRevenue?.[0]?.total || 0;

        return [
            { title: 'Total Orders', value: totalOrders },
            { title: 'Shipping', value: statusMap.shipping || 0 },
            { title: 'Shipped', value: statusMap.shipped || 0 },
            { title: 'Total Savings', value: `$${totalRevenue.toLocaleString()}` },
        ];
    }

    async findById(id: string, profileId: string) {
        const order = await this.orderModel
            .findOne({
                _id: new Types.ObjectId(id),
                profileId: new Types.ObjectId(profileId),
            })
            .populate('jobSite');

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async create(createOrderDto: CreateOrderDto, profileId: string, subscriptionInfo: { ordersUsed: number, includedOrders: number }) {
        const { ordersUsed = 0, includedOrders = 0 } = subscriptionInfo;

        if (ordersUsed >= includedOrders) {
            throw new ConflictException('Order quota exceeded for current subscription period');
        }

        const profile = await this.profileModel.findById(profileId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        const requirePayment = profile.preferences?.requireOrderPayment ?? false;

        const order = new this.orderModel({
            ...createOrderDto,
            profileId: new Types.ObjectId(profileId),
            jobSiteId: new Types.ObjectId(createOrderDto.jobSiteId),
            status: requirePayment ? OrderStatus.PENDING_PAYMENT : OrderStatus.PENDING,
            requirePayment,
            paymentStatus: requirePayment ? 'pending' : undefined,
            isSelfManaged: false,
            items: createOrderDto.items.map(item => ({
                ...item,
                unitPrice: 0,
                totalPrice: 0,
                deliveredQuantity: 0
            })),
            subtotal: 0,
            tax: 0,
            total: 0,
            requiredDeliveryDate: createOrderDto.requestedDeliveryDate || new Date(),
            statusHistory: [{
                status: requirePayment ? OrderStatus.PENDING_PAYMENT : OrderStatus.PENDING,
                timestamp: new Date(),
                notes: 'Order created'
            }]
        });

        await order.save();

        if (requirePayment) {
            await this.createPaymentIntent(order._id.toString());
        }

        return order;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto | UpdateOrderStatusDto, profileId: string) {
        const order = await this.findById(id, profileId);

        if ('status' in updateOrderDto && updateOrderDto.status !== order.status) {
            order.statusHistory.push({
                status: updateOrderDto.status,
                timestamp: new Date(),
                notes: updateOrderDto.notes || `Status changed to ${updateOrderDto.status}`
            });
        }

        Object.assign(order, {
            ...updateOrderDto,
            jobSiteId: 'jobSiteId' in updateOrderDto ? new Types.ObjectId(updateOrderDto.jobSiteId) : order.jobSiteId,
        });

        return order.save();
    }

    async remove(id: string, profileId: string): Promise<void> {
        const order = await this.findById(id, profileId);
        await order.deleteOne();
    }

    async routeOrderToSuppliers(id: string, supplierIds: string[]) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new ConflictException('Order must be in pending status to be routed');
        }

        const suppliers = await this.supplierCompanyModel
            .find({ _id: { $in: supplierIds.map(id => new Types.ObjectId(id)) } })
            .select('contact');

        if (suppliers.length !== supplierIds.length) {
            throw new NotFoundException('One or more suppliers not found');
        }

        order.invitedSuppliers = suppliers.map(s => s._id);
        order.status = OrderStatus.PENDING_QUOTATIONS;
        order.statusHistory.push({
            status: OrderStatus.PENDING_QUOTATIONS,
            timestamp: new Date(),
            notes: `Order routed to ${suppliers.length} suppliers`
        });

        // Send email notifications to suppliers
        for (const supplier of suppliers) {
            await this.mailerService.sendQuotationRequestEmail(
                supplier.contact.email,
                supplier.contact.name,
                order.profileId.toString(),
                order._id.toString(),
                order.items,
                supplier.contact.title,
            );
        }

        return order.save();
    }

    async updateDeliveryStatus(id: string, deliveryRecord: DeliveryRecord) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.SHIPPING && order.status !== OrderStatus.PARTIALLY_DELIVERED) {
            throw new ConflictException('Order must be in shipping or partially delivered status');
        }

        // Update delivered quantities
        for (const item of deliveryRecord.deliveredItems) {
            if (item.itemIndex >= 0 && item.itemIndex < order.items.length) {
                const orderItem = order.items[item.itemIndex];
                const newDeliveredQuantity = (orderItem.deliveredQuantity || 0) + item.quantity;

                if (newDeliveredQuantity > orderItem.quantity) {
                    throw new ConflictException(`Delivered quantity exceeds ordered quantity for item ${item.itemIndex}`);
                }

                orderItem.deliveredQuantity = newDeliveredQuantity;
                orderItem.lastDeliveryDate = deliveryRecord.date;
            }
        }

        // Add delivery record
        order.deliveryRecords.push(deliveryRecord);

        // Update order status based on delivery completion
        const isFullyDelivered = order.items.every(item =>
            item.deliveredQuantity === item.quantity
        );

        if (isFullyDelivered) {
            order.status = OrderStatus.DELIVERED;
            order.statusHistory.push({
                status: OrderStatus.DELIVERED,
                timestamp: new Date(),
                notes: 'All items delivered'
            });
        } else if (order.status !== OrderStatus.PARTIALLY_DELIVERED) {
            order.status = OrderStatus.PARTIALLY_DELIVERED;
            order.statusHistory.push({
                status: OrderStatus.PARTIALLY_DELIVERED,
                timestamp: new Date(),
                notes: 'Partial delivery recorded'
            });
        }

        return order.save();
    }

    async uploadInvoice(id: string, invoiceUrl: string) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        order.invoiceUrl = invoiceUrl;
        return order.save();
    }

    async createPaymentIntent(id: string) {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.stripePaymentIntentId) {
            throw new ConflictException('Payment intent already exists for this order');
        }

        const paymentIntent = await this.stripeService.createPaymentIntent({
            amount: Math.round(order.total * 100),
            currency: 'usd',
            metadata: {
                orderId: order._id.toString()
            }
        });

        order.stripePaymentIntentId = paymentIntent.id;
        await order.save();

        return paymentIntent;
    }

    async handlePaymentSuccess(paymentIntentId: string) {
        const order = await this.orderModel.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
        const paymentMethod = await this.stripeService.retrievePaymentMethod(paymentIntent.payment_method as string);

        order.paymentStatus = 'completed';
        order.paidAt = new Date();
        order.status = OrderStatus.PENDING;
        order.paymentDetails = {
            method: paymentMethod.type,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
            receiptUrl: paymentIntent.latest_charge as string
        };

        order.statusHistory.push({
            status: OrderStatus.PENDING,
            timestamp: new Date(),
            notes: 'Payment completed'
        });

        return order.save();
    }

    async handlePaymentFailure(paymentIntentId: string) {
        const order = await this.orderModel.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        order.paymentStatus = 'failed';
        order.status = OrderStatus.PAYMENT_FAILED;
        order.statusHistory.push({
            status: OrderStatus.PAYMENT_FAILED,
            timestamp: new Date(),
            notes: 'Payment failed'
        });

        return order.save();
    }
} 