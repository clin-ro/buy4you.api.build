import { ApiProperty } from '@nestjs/swagger';

export class DateRangeQueryDto {
    @ApiProperty({
        description: 'Start date for filtering',
        required: false,
        type: String,
        format: 'date',
        example: '2024-01-01'
    })
    startDate?: string;

    @ApiProperty({
        description: 'End date for filtering',
        required: false,
        type: String,
        format: 'date',
        example: '2024-12-31'
    })
    endDate?: string;
}

export class OrderQueryDto extends DateRangeQueryDto {
    @ApiProperty({
        description: 'Status to filter orders by',
        required: false,
        type: String,
        example: 'pending',
        enum: ['pending', 'partially_filled', 'partially_shipped', 'shipped', 'partially_completed', 'completed']
    })
    status?: string;
}

export class QuotationQueryDto {
    @ApiProperty({
        description: 'Status to filter quotations by',
        required: false,
        type: String,
        example: 'pending',
        enum: ['draft', 'pending', 'accepted', 'rejected']
    })
    status?: string;
} 