import { ApiProperty } from '@nestjs/swagger';

export class SupplierPerformanceResponseDto {
    @ApiProperty()
    completedOrders: number;

    @ApiProperty()
    onTimeDeliveries: number;

    @ApiProperty()
    lateDeliveries: number;

    @ApiProperty()
    partialDeliveries: number;

    @ApiProperty()
    rating: number;
}

export class DeliveryRecordResponseDto {
    @ApiProperty()
    date: Date;

    @ApiProperty()
    deliveredItems: {
        itemIndex: number;
        quantity: number;
    }[];

    @ApiProperty()
    notes?: string;

    @ApiProperty()
    isPartial: boolean;
}

export class SupplierOrderResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    profileId: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    items: {
        name: string;
        quantity: number;
        unit: string;
        description?: string;
        unitPrice: number;
        totalPrice: number;
        deliveredQuantity: number;
        lastDeliveryDate?: Date;
    }[];

    @ApiProperty()
    totalPrice: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    requiredDeliveryDate: Date;

    @ApiProperty({ type: [DeliveryRecordResponseDto] })
    deliveryRecords: DeliveryRecordResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
} 