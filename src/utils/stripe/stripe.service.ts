import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    constructor(@InjectStripeClient() private readonly stripe: Stripe) { }

    async createProduct(data: {
        name: string;
        description?: string;
        active: boolean;
        metadata: Record<string, string>;
    }): Promise<Stripe.Product> {
        return this.stripe.products.create(data);
    }

    async updateProduct(id: string, data: {
        name?: string;
        description?: string;
        active?: boolean;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Product> {
        return this.stripe.products.update(id, data);
    }

    async deleteProduct(id: string): Promise<Stripe.Product> {
        return this.stripe.products.update(id, { active: false });
    }

    async createPrice(data: {
        product: string;
        currency: string;
        unit_amount: number;
        recurring?: {
            interval: Stripe.Price.Recurring.Interval;
            interval_count: number;
        };
        metadata?: Record<string, string>;
        tax_behavior?: Stripe.Price.TaxBehavior;
    }): Promise<Stripe.Price> {
        return this.stripe.prices.create({
            ...data,
            tax_behavior: data.tax_behavior || 'exclusive',
        });
    }

    async updatePrice(id: string, data: { active: boolean }): Promise<Stripe.Price> {
        return this.stripe.prices.update(id, data);
    }

    async createPaymentLink(data: {
        line_items: Array<{
            price: string;
            quantity: number;
        }>;
        allow_promotion_codes?: boolean;
        automatic_tax?: { enabled: boolean };
        tax_id_collection?: { enabled: boolean };
        after_completion?: {
            type: Stripe.PaymentLink.AfterCompletion.Type;
            redirect: { url: string };
        };
    }): Promise<Stripe.PaymentLink> {
        return this.stripe.paymentLinks.create(data);
    }

    async listProducts(params?: Stripe.ProductListParams): Promise<Stripe.ApiList<Stripe.Product>> {
        return this.stripe.products.list(params);
    }

    async listPrices(params?: Stripe.PriceListParams): Promise<Stripe.ApiList<Stripe.Price>> {
        return this.stripe.prices.list(params);
    }

    async retrieveProduct(id: string): Promise<Stripe.Product> {
        return this.stripe.products.retrieve(id);
    }

    async retrievePrice(id: string): Promise<Stripe.Price> {
        return this.stripe.prices.retrieve(id);
    }

    async retrievePaymentLink(id: string): Promise<Stripe.PaymentLink> {
        return this.stripe.paymentLinks.retrieve(id);
    }

    async createPaymentIntent(data: {
        amount: number;
        currency: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.create({
            ...data,
            automatic_payment_methods: {
                enabled: true,
            },
        });
    }

    async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.retrieve(id);
    }

    async retrievePaymentMethod(id: string): Promise<Stripe.PaymentMethod> {
        return this.stripe.paymentMethods.retrieve(id);
    }

    async updatePaymentIntent(id: string, data: Stripe.PaymentIntentUpdateParams): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.update(id, data);
    }

    async cancelPaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.cancel(id);
    }
} 