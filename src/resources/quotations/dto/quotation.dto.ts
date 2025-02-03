import { OrderItem } from '@/schemas/mongo/order.schema';
import { QuotationStatus } from '@/schemas/mongo/quotation.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSupplierQuoteDto {
    @IsNotEmpty()
    @IsMongoId()
    supplierId: Types.ObjectId;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItem)
    items: OrderItem[];

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    deliveryDate: Date;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateQuotationDto {
    @IsNotEmpty()
    @IsMongoId()
    jobSiteId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItem)
    items: OrderItem[];

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    validUntil: Date;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsArray()
    @IsMongoId({ each: true })
    invitedSuppliers: string[];
}

export class QuotationItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    unitOfMeasure: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    unitPrice?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    totalPrice?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    deliveredQuantity?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateQuotationDto {
    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    jobSiteId: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsMongoId({ each: true })
    invitedSuppliers: string[];

    @ApiProperty({ type: [QuotationItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuotationItemDto)
    items: QuotationItemDto[];

    @ApiProperty({ enum: QuotationStatus })
    @IsEnum(QuotationStatus)
    @IsOptional()
    status?: QuotationStatus;

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
}

export class SupplierQuoteDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsDate()
    @Type(() => Date)
    deliveryDate: Date;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateQuotationStatusDto {
    @IsNotEmpty()
    @IsEnum(QuotationStatus)
    status: QuotationStatus;

    @IsOptional()
    @IsString()
    notes?: string;
} 