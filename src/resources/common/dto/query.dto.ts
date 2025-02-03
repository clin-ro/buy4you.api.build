import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class DateRangeQueryDto {
    @ApiProperty({
        description: 'Start date for filtering',
        example: '2024-01-01',
        required: false
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({
        description: 'End date for filtering',
        example: '2024-12-31',
        required: false
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export class OrderQueryDto extends DateRangeQueryDto {
    @ApiProperty({
        description: 'Order status for filtering',
        enum: OrderStatus,
        required: false
    })
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;
}

export enum QuotationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED'
}

export class QuotationQueryDto extends DateRangeQueryDto {
    @ApiProperty({
        description: 'Quotation status for filtering',
        enum: QuotationStatus,
        required: false
    })
    @IsEnum(QuotationStatus)
    @IsOptional()
    status?: QuotationStatus;
} 