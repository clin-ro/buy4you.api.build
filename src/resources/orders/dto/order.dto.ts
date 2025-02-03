import { OrderStatus } from '@/schemas/mongo/order.schema';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsString()
    @IsNotEmpty()
    unitOfMeasure: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    jobSiteId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    requestedDeliveryDate?: Date;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    additionalNotes?: string;
}

export class UpdateOrderDto extends CreateOrderDto { }

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsString()
    @IsOptional()
    notes?: string;
} 