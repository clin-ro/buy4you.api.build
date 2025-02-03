import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';

export interface UserDocument extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    roles: Role[];
    tokens: { token: string; createdAt: Date }[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLogin?: Date;
    isActive: boolean;
    role: Role;
    apiKey: string;
    canManageOwnOrders: boolean;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, trim: true })
    firstName: string;

    @Prop({ required: true, trim: true })
    lastName: string;

    @Prop({ default: false })
    isAdmin: boolean;

    @Prop({ type: [String], enum: Object.values(Role), default: [Role.BUYER] })
    roles: Role[];

    @Prop({ type: [{ token: String, createdAt: Date }] })
    tokens: { token: string; createdAt: Date }[];

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date;

    @Prop()
    lastLogin?: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ required: true, enum: Object.values(Role) })
    role: Role;

    @Prop({ unique: true, sparse: true })
    apiKey: string;

    @Prop({ type: Boolean, default: false })
    canManageOwnOrders: boolean;

    @Prop({ type: Boolean, default: false })
    isVerified: boolean;

    @Prop({ type: Boolean, default: false })
    isBlocked: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export type UserWithTimestamps = User & UserDocument; 