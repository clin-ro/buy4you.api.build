import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty()
    jobSiteId: string;

    @ApiProperty()
    items: OrderItemDto[];

    @ApiProperty({ required: false })
    notes?: string;
}

export class OrderItemDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unit: string;

    @ApiProperty({ required: false })
    description?: string;
}

export class CreateJobSiteDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    state: string;

    @ApiProperty()
    zip: string;

    @ApiProperty({ required: false })
    notes?: string;
}

export class UpdateJobSiteDto {
    @ApiProperty({ required: false })
    name?: string;

    @ApiProperty({ required: false })
    address?: string;

    @ApiProperty({ required: false })
    city?: string;

    @ApiProperty({ required: false })
    state?: string;

    @ApiProperty({ required: false })
    zip?: string;

    @ApiProperty({ required: false })
    notes?: string;
}

export class AddBuyerToJobSiteDto {

    @ApiProperty({ required: true })
    buyerId: string;


    @ApiProperty({ enum: ['admin', 'member'] })
    role: string;
} 