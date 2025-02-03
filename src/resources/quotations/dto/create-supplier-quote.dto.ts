import { OrderItem } from '@/schemas/mongo/order.schema';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
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