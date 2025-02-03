import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CoordinatesDto {
    @ApiProperty()
    @IsNumber()
    latitude: number;

    @ApiProperty()
    @IsNumber()
    longitude: number;
}

export class AddressDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    streetAddress: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    region: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({ type: CoordinatesDto })
    @ValidateNested()
    @Type(() => CoordinatesDto)
    coordinates: CoordinatesDto;
}

export class ContactDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;
}

export class DeliveryInstructionsDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    accessInstructions?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    deliveryHours?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    specialRequirements?: string;

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    contactPersons?: string[];
}

export class CreateJobSiteDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ type: AddressDto })
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @ApiProperty({ type: ContactDto })
    @ValidateNested()
    @Type(() => ContactDto)
    contact: ContactDto;

    @ApiProperty({ type: DeliveryInstructionsDto, required: false })
    @ValidateNested()
    @Type(() => DeliveryInstructionsDto)
    @IsOptional()
    deliveryInstructions?: DeliveryInstructionsDto;

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ type: [String], required: false, default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    preferredSuppliers?: string[];
}

export class UpdateJobSiteDto extends CreateJobSiteDto { } 