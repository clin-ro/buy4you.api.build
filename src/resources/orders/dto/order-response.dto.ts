import { ApiProperty } from '@nestjs/swagger';

export class OrderRequestItemDto {
    @ApiProperty({ required: true })
    name: string;

    @ApiProperty({ required: true })
    quantity: number;

    @ApiProperty({ required: true })
    unit: string;
}

export class OrderItemsLLMRequestDto {
    @ApiProperty({ required: true, type: [OrderRequestItemDto] })
    items: OrderRequestItemDto[];

    @ApiProperty({ required: true })
    prompt: string;
}

export class OrderItemResponseDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unit: string;

    @ApiProperty()
    description?: string;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    totalPrice: number;

    @ApiProperty()
    deliveredQuantity: number;

    @ApiProperty()
    lastDeliveryDate?: Date;
}

export class OrderResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    profileId: string;

    @ApiProperty()
    jobSiteId: string;

    @ApiProperty()
    status: string;

    @ApiProperty({ type: [OrderItemResponseDto] })
    items: OrderItemResponseDto[];

    @ApiProperty()
    totalPrice: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    requiredDeliveryDate: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
} 