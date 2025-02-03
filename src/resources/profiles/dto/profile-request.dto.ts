import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum CompanyType {
    COMPANY = 'company',
    INDIVIDUAL = 'individual',
}

export class AddressDto {
    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @IsString()
    @IsNotEmpty()
    country: string;
}

export class CompanyMetadataDto {
    @IsString()
    @IsOptional()
    taxId?: string;

    @IsString()
    @IsOptional()
    website?: string;
}

export class CompanyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(CompanyType)
    @IsNotEmpty()
    type: CompanyType;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsNotEmpty()
    address: AddressDto;

    @ValidateNested()
    @Type(() => CompanyMetadataDto)
    @IsOptional()
    metadata?: CompanyMetadataDto;
}

export class UpdateProfileRequestDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ValidateNested()
    @Type(() => AddressDto)
    @IsNotEmpty()
    billingAddress: AddressDto;

    @ValidateNested()
    @Type(() => CompanyDto)
    @IsOptional()
    company?: CompanyDto;
}

export class UpdateSubscriptionRequestDto {
    @IsString()
    @IsNotEmpty()
    planId: string;
} 