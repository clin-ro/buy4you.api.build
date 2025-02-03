import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PricingInterval {
    @Prop({ required: true, enum: ['month', 'year'] })
    interval: string;

    @Prop({ required: true })
    intervalCount: number;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    includedOrders: number;

    @Prop({ default: false })
    isDefault: boolean;
}

@Schema({ timestamps: true })
export class SubscriptionPlan extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ type: [String], required: true })
    features: string[];

    @Prop({ required: true })
    pricePerExtraOrder: number;

    @Prop({ required: true, enum: ['basic', 'priority', '24/7'] })
    supportLevel: string;

    @Prop({ required: true, default: true })
    isActive: boolean;

    @Prop({ required: true, default: false })
    isDefault: boolean;

    @Prop({ required: true, enum: ['gbp', 'usd', 'eur', 'ron'] })
    currency: string;

    @Prop({ type: [PricingInterval], required: true })
    pricingIntervals: PricingInterval[];

    @Prop({ required: false })
    stripeProductId: string;

    @Prop({ type: Map, of: String, required: false })
    stripePriceIds: Map<string, string>;

    @Prop({ required: false })
    stripePerOrderPriceId: string;

    @Prop({ enum: ['inclusive', 'exclusive'], default: 'exclusive' })
    taxBehavior: string;

    @Prop()
    trialPeriodDays?: number;

    @Prop({ type: Map, of: String })
    metadata: Map<string, string>;

    @Prop({ type: Object })
    customFeatures: Record<string, any>;

    @Prop({ type: Map, of: String })
    paymentLinks: Map<string, string>;

    @Prop({ required: false, default: false })
    isFree: boolean;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan); 