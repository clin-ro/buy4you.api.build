import { ApiProperty } from '@nestjs/swagger';

export class QuotationItemResponseDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unit: string;

    @ApiProperty()
    description?: string;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    totalPrice: number;
}

export class SupplierQuoteResponseDto {
    @ApiProperty()
    supplierId: string;

    @ApiProperty({ type: [QuotationItemResponseDto] })
    items: QuotationItemResponseDto[];

    @ApiProperty()
    totalPrice: number;

    @ApiProperty()
    currency: string;

    @ApiProperty()
    deliveryDate: Date;

    @ApiProperty()
    notes?: string;

    @ApiProperty()
    submittedAt: Date;
}

export class QuotationResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    profileId: string;

    @ApiProperty()
    jobSiteId: string;

    @ApiProperty()
    status: string;

    @ApiProperty({ type: [String] })
    invitedSuppliers: string[];

    @ApiProperty({ type: [QuotationItemResponseDto] })
    items: QuotationItemResponseDto[];

    @ApiProperty({ type: [SupplierQuoteResponseDto] })
    supplierQuotes: SupplierQuoteResponseDto[];

    @ApiProperty()
    selectedQuotationId?: string;

    @ApiProperty()
    validUntil: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
} 