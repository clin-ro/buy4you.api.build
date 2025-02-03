import { StripeWebhookService } from '@/utils/stripe/stripe-webhook.service';
import { StripeService } from '@/utils/stripe/stripe.service';
import { StripeModule as NestStripeModule } from '@golevelup/nestjs-stripe';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
    imports: [
        NestStripeModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const apiKey = configService.get<string>('STRIPE_SECRET_KEY');
                const webhookSecret = configService.get<string>('STRIPE_WEBHOOK_SECRET');

                if (!apiKey) {
                    throw new Error('STRIPE_SECRET_KEY is not configured');
                }

                if (!webhookSecret) {
                    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
                }

                return {
                    apiKey,
                    webhookConfig: {
                        stripeSecrets: {
                            account: webhookSecret,
                        },
                        requestBodyProperty: 'rawBody',
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [StripeService, StripeWebhookService],
    exports: [StripeService, StripeWebhookService],
})
export class StripeModule { } 