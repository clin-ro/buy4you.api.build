import { Order } from '@/schemas/mongo/order.schema';
import { Profile } from '@/schemas/mongo/profile.schema';
import { Quotation } from '@/schemas/mongo/quotation.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderQueryDto, QuotationQueryDto } from '../common/dto/query.dto';
import { SubmitQuoteDto, UpdateSupplierProfileDto } from './dto/supplier-request.dto';

@Injectable()
export class SupplierService {
    constructor(
        @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        @InjectModel(Quotation.name) private readonly quotationModel: Model<Quotation>
    ) { }

    async getProfile() {
        const profile = await this.profileModel.findOne({ type: 'SUPPLIER' });
        if (!profile) {
            throw new NotFoundException('Supplier profile not found');
        }
        return profile;
    }

    async updateProfile(updateProfileDto: UpdateSupplierProfileDto) {
        const profile = await this.profileModel.findOneAndUpdate(
            { type: 'SUPPLIER' },
            { $set: updateProfileDto },
            { new: true }
        );
        if (!profile) {
            throw new NotFoundException('Supplier profile not found');
        }
        return profile;
    }

    async findOrders(query: OrderQueryDto) {
        const filter: any = {};

        if (query.status) {
            filter.status = query.status;
        }

        if (query.startDate) {
            filter.createdAt = { $gte: new Date(query.startDate) };
        }

        if (query.endDate) {
            filter.createdAt = { ...filter.createdAt, $lte: new Date(query.endDate) };
        }

        return this.orderModel.find(filter).sort({ createdAt: -1 });
    }

    async findOrderById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Invalid order ID');
        }

        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return order;
    }

    async findQuotations(query: QuotationQueryDto) {
        const filter: any = {};

        if (query.status) {
            filter.status = query.status;
        }

        if (query.startDate) {
            filter.createdAt = { $gte: new Date(query.startDate) };
        }

        if (query.endDate) {
            filter.createdAt = { ...filter.createdAt, $lte: new Date(query.endDate) };
        }

        return this.quotationModel.find(filter).sort({ createdAt: -1 });
    }

    async findQuotationById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('Invalid quotation ID');
        }

        const quotation = await this.quotationModel.findById(id);
        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }
        return quotation;
    }

    async submitQuote(orderId: string, quoteDto: SubmitQuoteDto) {
        if (!Types.ObjectId.isValid(orderId)) {
            throw new NotFoundException('Invalid order ID');
        }

        const order = await this.orderModel.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const quotation = await this.quotationModel.create({
            orderId: new Types.ObjectId(orderId),
            items: quoteDto.items,
            deliveryTerms: quoteDto.deliveryTerms,
            notes: quoteDto.notes,
            status: 'PENDING'
        });

        await this.orderModel.findByIdAndUpdate(orderId, {
            $push: { quotations: quotation._id }
        });

        return quotation;
    }
} 