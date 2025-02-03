import { BaseEntity } from '@/schemas/mongo/common.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum OrderStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    PENDING_PAYMENT = 'pending_payment',
    PAYMENT_FAILED = 'payment_failed',
    PENDING_QUOTATIONS = 'pending_quotations',
    QUOTATIONS_RECEIVED = 'quotations_received',
    QUOTATION_SELECTED = 'quotation_selected',
    SHIPPING = 'shipping',
    PARTIALLY_DELIVERED = 'partially_delivered',
    DELIVERED = 'delivered',
    CANCELED = 'canceled'
}

@Schema()
export class OrderItem {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop()
    unit?: string;

    @Prop()
    description?: string;

    @Prop({ type: Number })
    unitPrice?: number;

    @Prop({ type: Number })
    totalPrice?: number;

    @Prop({ type: Number, default: 0 })
    deliveredQuantity?: number;

    @Prop({ type: Date })
    lastDeliveryDate?: Date;
}

@Schema()
export class OrderStatusHistory {
    @Prop({ required: true, enum: Object.values(OrderStatus) })
    status: OrderStatus;

    @Prop({ type: Date, required: true })
    timestamp: Date;

    @Prop({ type: String })
    notes?: string;
}

@Schema()
export class DeliveryRecord {
    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({
        type: [{
            itemIndex: Number,
            quantity: Number,
            notes: String
        }], required: true
    })
    deliveredItems: { itemIndex: number; quantity: number; notes?: string; }[];

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: Boolean, default: false })
    isPartial: boolean;
}

@Schema({ timestamps: true })
export class Order extends BaseEntity {
    @Prop({ type: Types.ObjectId, ref: 'JobSite', required: true })
    jobSiteId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Profile', required: true })
    profileId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ type: Boolean, required: true, default: false })
    isSelfManaged: boolean;

    @Prop({ type: [Types.ObjectId], ref: 'SupplierCompany' })
    invitedSuppliers: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Quotation' }] })
    quotations: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Quotation' })
    selectedQuotationId?: Types.ObjectId;

    @Prop({ type: [OrderItem], required: true, min: 1 })
    items: OrderItem[];

    @Prop({ required: true })
    requiredDeliveryDate: Date;

    @Prop({ type: [OrderStatusHistory], default: [] })
    statusHistory: OrderStatusHistory[];

    @Prop({ type: [DeliveryRecord], default: [] })
    deliveryRecords: DeliveryRecord[];

    @Prop({ required: true, enum: Object.values(OrderStatus), default: OrderStatus.DRAFT })
    status: OrderStatus;

    @Prop()
    notes?: string;

    @Prop({ type: Number, required: true })
    subtotal: number;

    @Prop({ type: Number, required: true })
    tax: number;

    @Prop({ type: Number, required: true })
    total: number;

    @Prop({ type: String })
    invoiceUrl?: string;

    @Prop({ type: Boolean, required: true, default: false })
    requirePayment: boolean;

    @Prop({ type: String, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'] })
    paymentStatus?: string;

    @Prop({ type: String })
    stripePaymentIntentId?: string;

    @Prop({ type: Date })
    paidAt?: Date;

    @Prop({ type: Object })
    paymentDetails?: {
        method: string;
        last4?: string;
        brand?: string;
        receiptUrl?: string;
    };
}

export const OrderSchema = SchemaFactory.createForClass(Order); 