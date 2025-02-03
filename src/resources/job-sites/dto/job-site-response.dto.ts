import { ApiProperty } from '@nestjs/swagger';
import { AddressDto, ContactDto, DeliveryInstructionsDto } from './job-site.dto';

export class JobSiteResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ type: AddressDto })
    address: AddressDto;

    @ApiProperty({ type: ContactDto })
    contact: ContactDto;

    @ApiProperty()
    profileId: string;

    @ApiProperty({ type: [String] })
    buyers: string[];

    @ApiProperty({ type: [String] })
    orders: string[];

    @ApiProperty({ type: [String] })
    quotations: string[];

    @ApiProperty({ type: DeliveryInstructionsDto })
    deliveryInstructions?: DeliveryInstructionsDto;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty({ type: [String] })
    preferredSuppliers: string[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
} 