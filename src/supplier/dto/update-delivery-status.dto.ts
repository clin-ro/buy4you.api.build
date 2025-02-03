import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class DeliveredItemDto {
    @IsNotEmpty()
    @IsNumber()
    itemIndex: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateDeliveryStatusDto {
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    date: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveredItemDto)
    deliveredItems: DeliveredItemDto[];

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    isPartial?: boolean;
} 