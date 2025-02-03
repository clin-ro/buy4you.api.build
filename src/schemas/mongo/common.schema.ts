import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Coordinates {
    @Prop({ type: Number, required: true })
    longitude: number;

    @Prop({ type: Number, required: true })
    latitude: number;
}

@Schema()
export class Address {
    @Prop({ required: true })
    streetAddress: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    region: string;

    @Prop({ required: true })
    postalCode: string;

    @Prop({ required: true })
    country: string;

    @Prop({ type: Coordinates, required: true })
    coordinates: Coordinates;

    @Prop()
    placeId?: string;

    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

@Schema()
export class Contact {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    phone: string;

    @Prop()
    email: string;

    @Prop()
    title?: string;

    @Prop()
    department?: string;

    @Prop()
    image?: string;
}

@Schema()
export class BaseEntity {
    @Prop()
    id?: string;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

@Schema()
export class VerifiableEntity extends BaseEntity {
    @Prop({ type: Boolean, default: false })
    isVerified: boolean;

    @Prop({ type: String })
    verificationCode?: string;

    @Prop({ type: Date })
    verificationExpiry?: Date;
} 