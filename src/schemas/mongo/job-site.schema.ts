import { Contact } from '@/schemas/mongo/common.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class DeliveryInstructions {
    @Prop({ type: String })
    accessInstructions?: string;

    @Prop({ type: String })
    deliveryHours?: string;

    @Prop({ type: String })
    specialRequirements?: string;

    @Prop({ type: [String] })
    contactPersons?: string[];
}

export interface JobSiteAddress {
    streetAddress: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

@Schema({ timestamps: true })
export class JobSite extends Document {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Profile', required: true })
    profileId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ type: Object, required: true })
    address: JobSiteAddress;

    @Prop({ type: Contact, required: true })
    contact: Contact;

    @Prop({ type: [{ type: Types.ObjectId }], default: [] })
    buyers: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }] })
    orders?: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Quotation' }] })
    quotations?: Types.ObjectId[];

    @Prop({ type: DeliveryInstructions })
    deliveryInstructions?: DeliveryInstructions;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'SupplierCompany' }] })
    preferredSuppliers?: Types.ObjectId[];

    @Prop({ type: String, default: 'active', enum: ['active', 'inactive', 'archived'] })
    status: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const JobSiteSchema = SchemaFactory.createForClass(JobSite);

// Add indexes
JobSiteSchema.index({ userId: 1, name: 1 });
JobSiteSchema.index({ userId: 1, 'address.streetAddress': 1, 'address.city': 1 }); 
