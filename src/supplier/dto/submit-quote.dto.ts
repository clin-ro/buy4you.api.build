import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class QuoteItemDto {
    @ApiProperty({ description: 'Name of the item' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Quantity of the item' })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({ description: 'Unit of measurement' })
    @IsNotEmpty()
    @IsString()
    unit: string;

    @ApiProperty({ description: 'Additional description of the item', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Price per unit' })
    @IsNotEmpty()
    @IsNumber()
    unitPrice: number;

    @ApiProperty({ description: 'Total price for this item' })
    @IsNotEmpty()
    @IsNumber()
    totalPrice: number;
}

export class QuoteFileDto {
    @ApiProperty({ description: 'Name of the uploaded file' })
    @IsNotEmpty()
    @IsString()
    fileName: string;

    @ApiProperty({ description: 'MIME type of the file' })
    @IsNotEmpty()
    @IsString()
    contentType: string;

    @ApiProperty({ description: 'Size of the file in bytes' })
    @IsNotEmpty()
    @IsNumber()
    size: number;
}

export class SubmitQuoteDto {
    @ApiProperty({ type: [QuoteItemDto], description: 'List of items in the quotation' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuoteItemDto)
    items: QuoteItemDto[];

    @ApiProperty({ description: 'Expected delivery date' })
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    deliveryDate: Date;

    @ApiProperty({ description: 'Additional notes for the quotation', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        type: 'file',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
            }
        },
        description: 'PDF file containing the quotation'
    })
    file: QuoteFileDto;
}

export { UpdateProfileRequestDto as UpdateSupplierProfileDto } from '@/resources/profiles/dto/profile-request.dto';
