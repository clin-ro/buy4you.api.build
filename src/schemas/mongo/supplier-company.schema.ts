import { Address, Contact, VerifiableEntity } from '@/schemas/mongo/common.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Rating {
    @Prop({ type: Number, default: 0, min: 0, max: 5 })
    average: number;

    @Prop({ type: Number, default: 0 })
    total: number;

    @Prop({ type: [Number], default: [0, 0, 0, 0, 0] })
    distribution: number[];
}

@Schema()
export class Performance {
    @Prop({ type: Number, default: 0 })
    totalQuotations: number;

    @Prop({ type: Number, default: 0 })
    acceptedQuotations: number;

    @Prop({ type: Number, default: 0 })
    rejectedQuotations: number;

    @Prop({ type: Number, default: 0 })
    totalOrders: number;

    @Prop({ type: Number, default: 0 })
    completedOrders: number;

    @Prop({ type: Number, default: 0 })
    onTimeDeliveries: number;

    @Prop({ type: Number, default: 0 })
    lateDeliveries: number;

    @Prop({ type: Number, default: 0 })
    partialDeliveries: number;

    @Prop({ type: Number, default: 0 })
    canceledOrders: number;

    @Prop({ type: Number, default: 0 })
    averageResponseTime: number;
}

@Schema({ timestamps: true })
export class SupplierCompany extends VerifiableEntity {
    @Prop({ type: Contact, required: true })
    contact: Contact;

    @Prop({ type: Address, required: true })
    address: Address;

    @Prop({ type: String })
    website?: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: String })
    logo?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'SupplierCategory' }] })
    categories: Types.ObjectId[];

    @Prop({ type: Rating, default: {} })
    rating: Rating;

    @Prop({ type: Performance, default: {} })
    performance: Performance;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Profile' }] })
    employees: Types.ObjectId[];

    @Prop({ type: Boolean, default: true })
    acceptingQuotations: boolean;
}

export const SupplierCompanySchema = SchemaFactory.createForClass(SupplierCompany); 