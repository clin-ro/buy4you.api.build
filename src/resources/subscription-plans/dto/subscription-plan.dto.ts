import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum SupportLevel {
    BASIC = 'basic',
    PRIORITY = 'priority',
    SUPPORT_24_7 = '24/7',
}

export enum Currency {
    GBP = 'gbp',
    USD = 'usd',
    EUR = 'eur',
    RON = 'ron',
}

export class PricingIntervalDto {
    @IsEnum(['month', 'year'])
    @IsNotEmpty()
    interval: 'month' | 'year';

    @IsNumber()
    @IsNotEmpty()
    intervalCount: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    includedOrders: number;

    @IsBoolean()
    @IsNotEmpty()
    isDefault: boolean;
}

export class SubscriptionPlanDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    features: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PricingIntervalDto)
    @IsNotEmpty()
    pricingIntervals: PricingIntervalDto[];

    @IsNumber()
    @IsNotEmpty()
    pricePerExtraOrder: number;

    @IsEnum(SupportLevel)
    @IsNotEmpty()
    supportLevel: SupportLevel;

    @IsEnum(Currency)
    @IsNotEmpty()
    currency: Currency;

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

    @IsBoolean()
    @IsNotEmpty()
    isDefault: boolean;

    @IsString()
    @IsOptional()
    stripeProductId?: string;

    @IsString()
    @IsOptional()
    stripePerOrderPriceId?: string;
}

export class CreateSubscriptionPlanDto {
    name: string;
    description?: string;
    features: string[];
    pricePerExtraOrder: number;
    supportLevel: string;
    isActive: boolean;
    isDefault?: boolean;
    isFree?: boolean;
    currency: string;
    taxBehavior?: 'inclusive' | 'exclusive';
    trialPeriodDays?: number;
    metadata?: Record<string, string>;
    customFeatures?: Record<string, any>;
    pricingIntervals: PricingIntervalDto[];
}

export class UpdateSubscriptionPlanDto extends CreateSubscriptionPlanDto { }

export class ToggleSubscriptionPlanDto {
    isActive: boolean;
} 