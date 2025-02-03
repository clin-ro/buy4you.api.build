import { BaseEntity } from '@/schemas/mongo/common.schema';
import { OrderItem } from '@/schemas/mongo/order.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum QuotationStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    SENT_TO_SUPPLIERS = 'sent_to_suppliers',
    RECEIVED_QUOTES = 'received_quotes',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired'
}

@Schema()
export class SupplierQuote {
    @Prop({ type: Types.ObjectId, ref: 'SupplierCompany', required: true })
    supplierId: Types.ObjectId;

    @Prop({ type: [OrderItem], required: true })
    items: OrderItem[];

    @Prop({ type: Number, required: true })
    subtotal: number;

    @Prop({ type: Number, required: true })
    tax: number;

    @Prop({ type: Number, required: true })
    total: number;

    @Prop({ required: true })
    deliveryDate: Date;

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: Date, required: true })
    createdAt: Date;

    @Prop({ type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
    status: string;

    @Prop({ type: String })
    rejectionReason?: string;

    @Prop({ type: String, required: true })
    submissionToken: string;

    @Prop({ type: Date })
    submissionExpiry: Date;

    @Prop({ type: Date })
    submittedAt?: Date;

    @Prop({ type: String })
    fileUrl?: string;
}

@Schema({ timestamps: true })
export class Quotation extends BaseEntity {
    @Prop({ type: Types.ObjectId, ref: 'JobSite', required: true })
    jobSiteId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Profile', required: true })
    profileId: Types.ObjectId;

    @Prop({ type: [OrderItem], required: true, min: 1 })
    items: OrderItem[];

    @Prop({ required: true })
    validUntil: Date;

    @Prop({ required: true, enum: Object.values(QuotationStatus), default: QuotationStatus.DRAFT })
    status: QuotationStatus;

    @Prop()
    notes?: string;

    @Prop({ type: [Types.ObjectId], ref: 'SupplierCompany', required: true })
    invitedSuppliers: Types.ObjectId[];

    @Prop({ type: [SupplierQuote], default: [] })
    supplierQuotes: SupplierQuote[];

    @Prop({ type: Types.ObjectId, ref: 'Order' })
    orderId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SupplierCompany' })
    selectedSupplierId?: Types.ObjectId;

    @Prop({ type: Boolean, required: true, default: false })
    isSelfManaged: boolean;
}

export const QuotationSchema = SchemaFactory.createForClass(Quotation); 