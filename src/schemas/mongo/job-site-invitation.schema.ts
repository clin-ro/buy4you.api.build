import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    EXPIRED = 'expired'
}

@Schema({ timestamps: true })
export class JobSiteInvitation extends Document {
    @Prop({ type: Types.ObjectId, ref: 'JobSite', required: true })
    jobSiteId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Profile', required: true })
    inviterProfileId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ type: String, enum: Object.values(InvitationStatus), default: InvitationStatus.PENDING })
    status: InvitationStatus;

    @Prop({ type: Types.ObjectId, ref: 'Profile' })
    acceptedByProfileId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    acceptedByUserId?: Types.ObjectId;

    @Prop({ type: Date })
    acceptedAt?: Date;
}

export const JobSiteInvitationSchema = SchemaFactory.createForClass(JobSiteInvitation); 