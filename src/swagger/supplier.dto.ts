import { ApiProperty } from '@nestjs/swagger';

export class QuoteItemDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unit: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    totalPrice: number;
}

export class QuoteFileDto {
    @ApiProperty()
    fileName: string;

    @ApiProperty()
    contentType: string;

    @ApiProperty()
    size: number;
}

export class SubmitQuoteDto {
    @ApiProperty({ type: [QuoteItemDto] })
    items: QuoteItemDto[];

    @ApiProperty()
    deliveryDate: Date;

    @ApiProperty({ required: false })
    notes?: string;

    @ApiProperty()
    file: QuoteFileDto;
}

export class UpdateSupplierProfileDto {
    @ApiProperty({ required: false })
    companyName?: string;

    @ApiProperty({ required: false })
    address?: string;

    @ApiProperty({ required: false })
    city?: string;

    @ApiProperty({ required: false })
    state?: string;

    @ApiProperty({ required: false })
    zip?: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ required: false })
    website?: string;
} 