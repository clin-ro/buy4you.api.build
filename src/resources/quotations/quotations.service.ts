import { ProfilesService } from '@/resources/profiles/profiles.service';
import { Quotation, QuotationStatus } from '@/schemas/mongo/quotation.schema';
import { MongooseUtils } from '@/utils/mongoose/id.utils';
import { MongooseID } from '@/utils/mongoose/types';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateQuotationDto } from './dto/quotation.dto';

export interface CreateSupplierQuoteDto {
    supplierId: Types.ObjectId;
    items: Array<{
        orderItemId: string;
        unitPrice: number;
        quantity: number;
        notes?: string;
        totalPrice: number;
    }>;
    totalPrice: number;
    currency: string;
    notes?: string;
    validUntil: Date;
    deliveryDate: Date;
    fileUrl?: string;
}

@Injectable()
export class QuotationsService {
    constructor(
        @InjectModel(Quotation.name) private quotationModel: Model<Quotation>,
        private readonly profilesService: ProfilesService,
    ) { }

    async findAll(profileId: MongooseID) {
        return this.quotationModel
            .find({ profileId: MongooseUtils.toObjectId(profileId) })
            .sort({ createdAt: -1 })
            .populate(['jobSite', 'selectedSupplierId']);
    }

    async findById(id: MongooseID, userId: MongooseID) {
        const quotation = await this.quotationModel
            .findOne({
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            })
            .populate(['jobSite', 'selectedSupplierId']);

        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        return quotation;
    }

    async create(createQuotationDto: CreateSupplierQuoteDto, profileId: MongooseID) {
        const hasQuota = await this.profilesService.checkQuota(profileId.toString(), 'quotationsUsed');
        if (!hasQuota) {
            throw new ConflictException('Quotation quota exceeded for current subscription period');
        }

        const quotation = new this.quotationModel({
            ...createQuotationDto,
            profileId: MongooseUtils.toObjectId(profileId),
            status: QuotationStatus.DRAFT,
        });

        await quotation.save();
        await this.profilesService.updateSubscriptionUsage(profileId.toString(), 'quotations');

        return quotation;
    }

    async update(id: string, updateQuotationDto: UpdateQuotationDto, userId: string) {
        const quotation = await this.findById(id, userId);

        Object.assign(quotation, {
            ...updateQuotationDto,
            jobSiteId: new Types.ObjectId(updateQuotationDto.jobSiteId),
            invitedSuppliers: updateQuotationDto.invitedSuppliers.map(id => new Types.ObjectId(id)),
            items: updateQuotationDto.items.map(item => ({
                ...item,
                unitPrice: item.unitPrice || 0,
                totalPrice: item.quantity * (item.unitPrice || 0),
                deliveredQuantity: 0
            }))
        });

        await quotation.save();
        return quotation;
    }

    async updateStatus(id: MongooseID, updateStatusDto: { status: string }) {
        const quotation = await this.quotationModel.findById(MongooseUtils.toObjectId(id));
        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        quotation.status = updateStatusDto.status as QuotationStatus;
        await quotation.save();
        return quotation;
    }

    async addSupplierQuote(quotationId: MongooseID, quoteDto: CreateSupplierQuoteDto) {
        const quotation = await this.quotationModel.findById(MongooseUtils.toObjectId(quotationId));
        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        const subtotal = quoteDto.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * 0.1; // Example tax calculation

        const supplierQuote = {
            supplierId: quoteDto.supplierId,
            items: quoteDto.items.map(item => ({
                name: item.orderItemId, // Using orderItemId as name temporarily
                unit: 'unit', // Default unit
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                notes: item.notes,
                deliveredQuantity: 0
            })),
            subtotal,
            tax,
            total: subtotal + tax,
            status: 'pending',
            submissionToken: this.generateToken(),
            submissionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            createdAt: new Date(),
            deliveryDate: quoteDto.deliveryDate,
            currency: quoteDto.currency,
            notes: quoteDto.notes,
            fileUrl: quoteDto.fileUrl
        };

        quotation.supplierQuotes.push(supplierQuote);
        await quotation.save();
        return quotation;
    }

    async acceptSupplierQuote(id: MongooseID, supplierId: MongooseID, profileId: MongooseID) {
        const quotation = await this.findById(id, profileId);
        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        if (!quotation.isSelfManaged) {
            throw new ConflictException('Only self-managed quotations can be directly accepted by the buyer');
        }

        const supplierQuote = quotation.supplierQuotes.find(
            quote => MongooseUtils.equals(quote.supplierId, supplierId)
        );

        if (!supplierQuote) {
            throw new NotFoundException('Supplier quote not found');
        }

        supplierQuote.status = 'accepted';
        quotation.selectedSupplierId = MongooseUtils.toObjectId(supplierId);
        quotation.status = QuotationStatus.ACCEPTED;

        await quotation.save();
        return quotation;
    }

    async rejectSupplierQuote(id: MongooseID, supplierId: MongooseID, profileId: MongooseID, reason?: string) {
        const quotation = await this.findById(id, profileId);
        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        if (!quotation.isSelfManaged) {
            throw new ConflictException('Only self-managed quotations can be directly rejected by the buyer');
        }

        const supplierQuote = quotation.supplierQuotes.find(
            quote => MongooseUtils.equals(quote.supplierId, supplierId)
        );

        if (!supplierQuote) {
            throw new NotFoundException('Supplier quote not found');
        }

        supplierQuote.status = 'rejected';
        supplierQuote.rejectionReason = reason;

        // If all quotes are rejected, update quotation status
        const allRejected = quotation.supplierQuotes.every(quote => quote.status === 'rejected');
        if (allRejected) {
            quotation.status = QuotationStatus.REJECTED;
        }

        await quotation.save();
        return quotation;
    }

    async setSelfManaged(id: MongooseID, profileId: MongooseID, isSelfManaged: boolean) {
        const quotation = await this.findById(id, profileId);
        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        if (quotation.status !== QuotationStatus.DRAFT) {
            throw new ConflictException('Can only change self-management status for draft quotations');
        }

        quotation.isSelfManaged = isSelfManaged;
        return quotation.save();
    }

    private generateToken(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    async remove(id: string, userId: string) {
        const quotation = await this.findById(id, userId);
        await quotation.deleteOne();
    }
} 