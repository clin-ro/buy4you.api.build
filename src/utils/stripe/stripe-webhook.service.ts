import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
    @StripeWebhookHandler('product.created')
    handleProductCreated(event: Stripe.ProductCreatedEvent) {
        console.log('Product created:', event.data.object);
    }

    @StripeWebhookHandler('product.updated')
    handleProductUpdated(event: Stripe.ProductUpdatedEvent) {
        console.log('Product updated:', event.data.object);
    }

    @StripeWebhookHandler('price.created')
    handlePriceCreated(event: Stripe.PriceCreatedEvent) {
        console.log('Price created:', event.data.object);
    }

    @StripeWebhookHandler('price.updated')
    handlePriceUpdated(event: Stripe.PriceUpdatedEvent) {
        console.log('Price updated:', event.data.object);
    }

    @StripeWebhookHandler('payment_link.created')
    handlePaymentLinkCreated(event: Stripe.PaymentLinkCreatedEvent) {
        console.log('Payment link created:', event.data.object);
    }

    @StripeWebhookHandler('checkout.session.completed')
    handleCheckoutSessionCompleted(event: Stripe.CheckoutSessionCompletedEvent) {
        console.log('Checkout session completed:', event.data.object);
        // Here you would typically:
        // 1. Update subscription status in your database
        // 2. Send confirmation email
        // 3. Provision access to the service
    }

    @StripeWebhookHandler('customer.subscription.created')
    handleSubscriptionCreated(event: Stripe.CustomerSubscriptionCreatedEvent) {
        console.log('Subscription created:', event.data.object);
    }

    @StripeWebhookHandler('customer.subscription.updated')
    handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
        console.log('Subscription updated:', event.data.object);
    }

    @StripeWebhookHandler('customer.subscription.deleted')
    handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
        console.log('Subscription deleted:', event.data.object);
    }

    @StripeWebhookHandler('invoice.paid')
    handleInvoicePaid(event: Stripe.InvoicePaidEvent) {
        console.log('Invoice paid:', event.data.object);
    }

    @StripeWebhookHandler('invoice.payment_failed')
    handleInvoicePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
        console.log('Invoice payment failed:', event.data.object);
        // Here you would typically:
        // 1. Notify the customer
        // 2. Update subscription status
        // 3. Handle failed payment logic
    }
} 