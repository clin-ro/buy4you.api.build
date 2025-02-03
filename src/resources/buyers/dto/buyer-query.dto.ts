import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class DateRangeQueryDto {
    @ApiProperty({
        required: false,
        type: String,
        format: 'date'
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({
        required: false,
        type: String,
        format: 'date'
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}

export class StatusQueryDto {
    @ApiProperty({
        required: false,
        type: String
    })
    status?: string;
}

export class OrderQueryDto extends DateRangeQueryDto {
    @ApiProperty({
        required: false,
        type: String,
        enum: ['pending', 'partially_filled', 'partially_shipped', 'shipped', 'partially_completed', 'completed']
    })
    @IsEnum(['pending', 'partially_filled', 'partially_shipped', 'shipped', 'partially_completed', 'completed'])
    @IsOptional()
    status?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by job site ID'
    })
    @IsString()
    @IsOptional()
    jobSiteId?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by quotation ID'
    })
    @IsString()
    @IsOptional()
    quotationId?: string;

    @ApiProperty({
        required: false,
        description: 'Search term for order items or notes'
    })
    @IsString()
    @IsOptional()
    searchTerm?: string;

    @ApiProperty({
        required: false,
        description: 'Minimum total price'
    })
    @IsOptional()
    minTotalPrice?: number;

    @ApiProperty({
        required: false,
        description: 'Maximum total price'
    })
    @IsOptional()
    maxTotalPrice?: number;
}

export class QuotationQueryDto {
    @ApiProperty({
        required: false,
        type: String,
        enum: ['draft', 'pending', 'accepted', 'rejected']
    })
    @IsEnum(['draft', 'pending', 'accepted', 'rejected'])
    @IsOptional()
    status?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by job site ID'
    })
    @IsString()
    @IsOptional()
    jobSiteId?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by invited supplier ID'
    })
    @IsString()
    @IsOptional()
    supplierId?: string;

    @ApiProperty({
        required: false,
        description: 'Search term for quotation items or notes'
    })
    @IsString()
    @IsOptional()
    searchTerm?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by creation date range'
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by creation date range'
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}

export class SearchQueryDto {
    @ApiProperty({
        required: false,
        description: 'Search term for job site name or address'
    })
    @IsString()
    @IsOptional()
    term?: string;

    @ApiProperty({
        required: false,
        type: String,
        enum: ['active', 'inactive', 'completed']
    })
    @IsEnum(['active', 'inactive', 'completed'])
    @IsOptional()
    status?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by contact name'
    })
    @IsString()
    @IsOptional()
    contactName?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by contact phone'
    })
    @IsString()
    @IsOptional()
    contactPhone?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by creation date range'
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({
        required: false,
        description: 'Filter by creation date range'
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;
} 