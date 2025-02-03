import { SubscriptionPlansService } from '@/resources/subscription-plans/subscription-plans.service';
import { StripeModule } from '@/utils/stripe/stripe.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [StripeModule],
    providers: [SubscriptionPlansService],
    exports: [SubscriptionPlansService],
})
export class SubscriptionPlansModule { } 