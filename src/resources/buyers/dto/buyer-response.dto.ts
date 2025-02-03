import { JobSite } from '@/schemas/mongo/job-site.schema';
import { Profile } from '@/schemas/mongo/profile.schema';
import { Quotation } from '@/schemas/mongo/quotation.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class JobSiteResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the job site',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the job site',
        example: 'Downtown Project'
    })
    name: string;

    @ApiProperty({
        description: 'Address of the job site',
        example: '123 Main St, City, Country'
    })
    address: string;

    @ApiProperty({
        description: 'Contact person name',
        example: 'John Doe'
    })
    contactName: string;

    @ApiProperty({
        description: 'Contact person phone',
        example: '+1234567890'
    })
    contactPhone: string;

    @ApiProperty({
        description: 'List of buyer IDs with access to this job site',
        type: [String],
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
    })
    buyers: string[];

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

export class JobSiteInvitationResponseDto {
    @ApiProperty()
    message: string;

    @ApiProperty()
    jobSiteId: string;

    @ApiProperty()
    token: string;

    @ApiProperty()
    expiresAt: Date;
}

export class AcceptJobSiteInvitationResponseDto {
    @ApiProperty()
    message: string;

    @ApiProperty()
    jobSiteId: string;
}

export class OrderItemResponseDto {
    @ApiProperty({
        description: 'Name of the item',
        example: 'Steel Pipes'
    })
    name: string;

    @ApiProperty({
        description: 'Quantity of the item',
        example: 100
    })
    quantity: number;

    @ApiProperty({
        description: 'Unit of measure',
        example: 'meters'
    })
    unitOfMeasure: string;

    @ApiProperty({
        description: 'Unit price',
        example: 50
    })
    unitPrice: number;

    @ApiProperty({
        description: 'Total price',
        example: 5000
    })
    totalPrice: number;

    @ApiProperty({
        description: 'Quantity delivered',
        example: 0
    })
    deliveredQuantity: number;
}

export class OrderResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the order'
    })
    _id: string;

    @ApiProperty({
        description: 'ID of the profile who created the order'
    })
    profileId: string;

    @ApiProperty({
        description: 'ID of the job site this order belongs to'
    })
    jobSiteId: string;

    @ApiProperty({
        description: 'ID of the quotation this order is based on'
    })
    quotationId: string;

    @ApiProperty({
        description: 'Current status of the order',
        enum: ['pending', 'partially_filled', 'partially_shipped', 'shipped', 'partially_completed', 'completed']
    })
    status: string;

    @ApiProperty({
        description: 'List of items in the order',
        type: [OrderItemResponseDto]
    })
    @Type(() => OrderItemResponseDto)
    items: OrderItemResponseDto[];

    @ApiProperty({
        description: 'Additional notes for the order'
    })
    notes?: string;

    @ApiProperty({
        description: 'Job site details',
        type: () => JobSite
    })
    jobSite?: JobSite;

    @ApiProperty({
        description: 'Quotation details',
        type: () => Quotation
    })
    quotation?: Quotation;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class QuotationResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    profileId: string;

    @ApiProperty()
    jobSiteId: string;

    @ApiProperty({
        enum: ['draft', 'pending', 'accepted', 'rejected']
    })
    status: string;

    @ApiProperty({
        type: [String]
    })
    invitedSuppliers: string[];

    @ApiProperty({
        type: [OrderItemResponseDto]
    })
    @Type(() => OrderItemResponseDto)
    items: OrderItemResponseDto[];

    @ApiProperty()
    notes?: string;

    @ApiProperty({
        type: () => JobSite
    })
    jobSite?: JobSite;

    @ApiProperty({
        type: () => Profile
    })
    selectedSupplierId?: Profile;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class NotificationResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    profileId: string;

    @ApiProperty({
        enum: ['order_status_change', 'quotation_received', 'invitation_received']
    })
    type: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    message: string;

    @ApiProperty()
    read: boolean;

    @ApiProperty()
    createdAt: Date;
} 