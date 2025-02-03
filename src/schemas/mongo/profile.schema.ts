import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Address {
    @Prop({ required: true })
    street: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    state: string;

    @Prop({ required: true })
    postalCode: string;

    @Prop({ required: true })
    country: string;
}

@Schema()
export class CompanyMetadata {
    @Prop()
    taxId?: string;

    @Prop()
    website?: string;
}

@Schema()
export class Company {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    registrationNumber: string;

    @Prop()
    vatNumber?: string;

    @Prop({ type: Address, required: true })
    address: Address;

    @Prop({ type: CompanyMetadata })
    metadata?: CompanyMetadata;
}

@Schema()
export class SubscriptionUsage {
    @Prop({ required: true })
    billingPeriodStart: Date;

    @Prop({ required: true })
    billingPeriodEnd: Date;

    @Prop({ required: true, default: 0 })
    ordersUsed: number;

    @Prop({ required: true, default: 0 })
    extraOrdersUsed: number;

    @Prop({ required: true, default: 0 })
    extraOrdersCost: number;

    @Prop({ required: true, default: 0 })
    currentBill: number;
}

@Schema()
export class Subscription {
    @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', required: true })
    plan: Types.ObjectId;

    @Prop({ required: true, enum: ['active', 'inactive', 'past_due', 'pending_cancellation'] })
    status: string;

    @Prop()
    stripeCustomerId?: string;

    @Prop()
    stripeSubscriptionId?: string;

    @Prop()
    defaultPaymentMethod?: string;

    @Prop({ required: true, enum: ['gbp', 'usd', 'eur', 'ron'] })
    currency: string;

    @Prop({ required: true })
    subscriptionFee: number;

    @Prop({ required: true })
    includedOrders: number;

    @Prop({ required: true })
    pricePerExtraOrder: number;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop()
    currentPeriodEnd?: Date;

    @Prop({ required: true, default: false })
    cancelAtPeriodEnd: boolean;

    @Prop()
    stripeStatus?: string;
}

@Schema()
export class ProfilePreferences {
    @Prop({ type: Boolean, default: false })
    allowSelfManagedOrders: boolean;

    @Prop({ type: Boolean, default: true })
    emailNotifications: boolean;

    @Prop({ type: Boolean, default: false })
    requireOrderPayment: boolean;

    @Prop({ type: [String], default: [] })
    preferredSuppliers: string[];

    @Prop({ type: Object })
    customPreferences?: Record<string, any>;
}

@Schema({ timestamps: true })
export class Profile extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ type: Address, required: true })
    billingAddress: Address;

    @Prop({ type: Company })
    company?: Company;

    @Prop({ type: Subscription })
    subscription?: Subscription;

    @Prop({
        type: SubscriptionUsage, default: () => ({
            billingPeriodStart: new Date(),
            billingPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            ordersUsed: 0,
            extraOrdersUsed: 0,
            extraOrdersCost: 0,
            currentBill: 0,
        })
    })
    subscriptionUsage: SubscriptionUsage;

    @Prop({ type: Boolean, default: false })
    isVerified: boolean;

    @Prop({
        type: Object,
        default: () => ({
            emailNotifications: {
                order_created: true,
                order_updated: true,
                order_completed: true,
                quotation_created: true,
                quotation_updated: true,
                quotation_completed: true,
                subscription_updated: true,
                payment_failed: true,
            },
            requireOrderPayment: false,
            allowSelfManagedOrders: false,
            preferredSuppliers: [],
        })
    })
    preferences: {
        emailNotifications: Record<string, boolean>;
        requireOrderPayment: boolean;
        allowSelfManagedOrders: boolean;
        preferredSuppliers: string[];
        customPreferences?: Record<string, any>;
    };

    @Prop({ type: Object })
    companyDetails?: {
        name: string;
        address: string;
        mainContactName: string;
        email: string;
        phone: string;
    };

    @Prop({ type: Object })
    individualDetails?: {
        fullName: string;
        address: string;
        email: string;
        phone: string;
    };

    @Prop({ required: true, enum: ['company', 'individual'] })
    type: 'company' | 'individual';
}

export const ProfileSchema = SchemaFactory.createForClass(Profile); 