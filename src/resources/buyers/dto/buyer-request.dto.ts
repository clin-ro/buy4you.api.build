import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class AddBuyerToJobSiteRequestDto {
    @ApiProperty()
    @IsString()
    buyerId: string;
}

export class CreateJobSiteInvitationDto {
    @ApiProperty({
        default: 72
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    expirationHours?: number;
}

export class OrderItemRequestDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty()
    @IsString()
    unitOfMeasure: string;
}

export class CreateOrderRequestDto {
    @ApiProperty()
    @IsString()
    jobSiteId: string;

    @ApiProperty({
        type: [OrderItemRequestDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemRequestDto)
    items: OrderItemRequestDto[];

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    additionalNotes?: string;
}

export class UpdateOrderStatusRequestDto {
    @ApiProperty({
        enum: ['shipped', 'completed']
    })
    @IsEnum(['shipped', 'completed'])
    status: 'shipped' | 'completed';
}

export class UpdateQuotationStatusRequestDto {
    @ApiProperty({
        enum: ['accepted', 'rejected']
    })
    @IsEnum(['accepted', 'rejected'])
    status: 'accepted' | 'rejected';
}

export class CreateQuotationRequestDto {
    @ApiProperty()
    @IsString()
    jobSiteId: string;

    @ApiProperty({
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    invitedSuppliers: string[];

    @ApiProperty({
        type: [OrderItemRequestDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemRequestDto)
    items: OrderItemRequestDto[];

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
} 