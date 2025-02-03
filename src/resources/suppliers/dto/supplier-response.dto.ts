import { ApiProperty } from '@nestjs/swagger';

export class SupplierProfileResponseDto {
    @ApiProperty({
        description: 'Unique identifier',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'Company name',
        example: 'Acme Supplies Ltd.'
    })
    companyName: string;

    @ApiProperty({
        description: 'Company address'
    })
    address: {
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
    contactName: string;

    @ApiProperty({
        description: 'Contact email',
        example: 'john.doe@acme.com'
    })
    email: string;

    @ApiProperty({
        description: 'Contact phone number',
        example: '+1234567890'
    })
    phone: string;

    @ApiProperty({
        description: 'Company website',
        example: 'https://acme.com',
        required: false
    })
    website?: string;

    @ApiProperty({
        description: 'Tax identification number',
        example: '123456789',
        required: false
    })
    taxId?: string;

    @ApiProperty({
        description: 'Additional metadata',
        required: false
    })
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'Whether the profile is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    updatedAt: Date;
}

export class SupplierOrderResponseDto {
    @ApiProperty({
        description: 'Unique identifier',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'Buyer profile ID',
        example: '507f1f77bcf86cd799439011'
    })
    buyerProfileId: string;

    @ApiProperty({
        description: 'Job site ID',
        example: '507f1f77bcf86cd799439011'
    })
    jobSiteId: string;

    @ApiProperty({
        description: 'Order status',
        example: 'PENDING'
    })
    status: string;

    @ApiProperty({
        description: 'Order items'
    })
    items: Array<{
        id: string;
        name: string;
        description: string;
        quantity: number;
        unit: string;
    }>;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    updatedAt: Date;
}

export class SupplierQuotationResponseDto {
    @ApiProperty({
        description: 'Unique identifier',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'Order ID',
        example: '507f1f77bcf86cd799439011'
    })
    orderId: string;

    @ApiProperty({
        description: 'Quotation status',
        example: 'PENDING'
    })
    status: string;

    @ApiProperty({
        description: 'Quoted items'
    })
    items: Array<{
        orderItemId: string;
        unitPrice: number;
        totalPrice: number;
    }>;

    @ApiProperty({
        description: 'Delivery terms',
        example: 'Delivery within 5 business days'
    })
    deliveryTerms: string;

    @ApiProperty({
        description: 'Additional notes',
        example: 'Price includes delivery and installation',
        required: false
    })
    notes?: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    updatedAt: Date;
} 