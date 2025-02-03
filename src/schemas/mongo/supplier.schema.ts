import { Address } from '@/schemas/mongo/common.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Supplier extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SupplierCompany', required: true })
    companyId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ type: Address })
    address?: Address;

    @Prop({ type: String })
    position?: string;

    @Prop({ type: Boolean, default: false })
    isAdmin: boolean;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'SupplierCategory' }] })
    categories?: Types.ObjectId[];

    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier); 