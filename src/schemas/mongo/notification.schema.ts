import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
    PROFILE_CREATED = 'profile_created',
    PROFILE_UPDATED = 'profile_updated',
    PROFILE_REVIEW = 'profile_review',
    PROFILE_STATUS = 'profile_status',
    ORDER_CREATED = 'order_created',
    ORDER_STATUS = 'order_status',
    SHIPPING_UPDATE = 'shipping_update',
    DELIVERY_CONFIRMATION = 'delivery_confirmation',
    QUOTATION_SUBMITTED = 'quotation_submitted',
    QUOTATION_STATUS = 'quotation_status',
    JOB_SITE_INVITATION = 'job_site_invitation',
    JOB_SITE_UPDATE = 'job_site_update',
    JOB_SITE_STATUS = 'job_site_status',
    PAYMENT_STATUS = 'payment_status',
    SUBSCRIPTION_STATUS = 'subscription_status'
}

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: NotificationType, required: true })
    type: NotificationType;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ type: Object })
    metadata: Record<string, any>;

    @Prop({ type: Object })
    data: Record<string, any>;

    @Prop({ default: false })
    read: boolean;

    @Prop()
    emailSentAt: Date;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification); 