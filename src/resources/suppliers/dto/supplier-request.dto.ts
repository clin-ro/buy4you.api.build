import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsObject, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class UpdateSupplierProfileDto {
    @ApiProperty({
        description: 'Company name',
        example: 'Acme Supplies Ltd.'
    })
    @IsString()
    @IsOptional()
    companyName?: string;

    @ApiProperty({
        description: 'Company address',
        example: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA'
        }
    })
    @IsObject()
    @IsOptional()
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };

    @ApiProperty({
        description: 'Contact person name',
        example: 'John Doe'
    })
    @IsString()
    @IsOptional()
    contactName?: string;

    @ApiProperty({
        description: 'Contact email',
        example: 'john.doe@acme.com'
    })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'Contact phone number',
        example: '+1234567890'
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({
        description: 'Company website',
        example: 'https://acme.com',
        required: false
    })
    @IsString()
    @IsOptional()
    website?: string;

    @ApiProperty({
        description: 'Tax identification number',
        example: '123456789',
        required: false
    })
    @IsString()
    @IsOptional()
    taxId?: string;

    @ApiProperty({
        description: 'Additional metadata',
        required: false,
        example: {
            certifications: ['ISO 9001', 'ISO 14001'],
            yearsInBusiness: 15
        }
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}

export class QuotationItemDto {
    @ApiProperty({
        description: 'ID of the order item this quote is for',
        example: '507f1f77bcf86cd799439011'
    })
    @IsString()
    orderItemId: string;

    @ApiProperty({
        description: 'Unit price for the item',
        example: 50.00
    })
    @IsNumber()
    @IsPositive()
    unitPrice: number;

    @ApiProperty({
        description: 'Total price for the item',
        example: 5000.00
    })
    @IsNumber()
    @IsPositive()
    totalPrice: number;
}

export class SubmitQuoteDto {
    @ApiProperty({
        description: 'List of items with pricing',
        type: [QuotationItemDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuotationItemDto)
    items: QuotationItemDto[];

    @ApiProperty({
        description: 'Delivery terms',
        example: 'Delivery within 5 business days'
    })
    @IsString()
    deliveryTerms: string;

    @ApiProperty({
        description: 'Additional notes',
        example: 'Price includes delivery and installation',
        required: false
    })
    @IsString()
    @IsOptional()
    notes?: string;
} 