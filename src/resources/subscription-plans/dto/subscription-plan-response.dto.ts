import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    billingCycle: string;

    @ApiProperty()
    features: string[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
} 