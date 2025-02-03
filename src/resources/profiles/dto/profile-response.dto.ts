import { AddressDto, CompanyDto } from './profile-request.dto';

export class SubscriptionUsageDto {
    billingPeriodStart: string;
    billingPeriodEnd: string;
    ordersUsed: number;
    extraOrdersUsed: number;
    extraOrdersCost: number;
    currentBill: number;
}

export class SubscriptionDto {
    plan: string;
    status: 'active' | 'inactive' | 'past_due' | 'pending_cancellation';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    defaultPaymentMethod?: string;
    currency: 'gbp' | 'usd' | 'eur' | 'ron';
    subscriptionFee: number;
    includedOrders: number;
    pricePerExtraOrder: number;
    startDate: string;
    endDate: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd: boolean;
    stripeStatus?: string;
}

export class ProfileResponseDto {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    billingAddress: AddressDto;
    company?: CompanyDto;
    subscription?: SubscriptionDto;
    subscriptionUsage?: SubscriptionUsageDto;
    createdAt: Date;
    updatedAt: Date;
} 