import { Global, Module } from '@nestjs/common';
import { JobSitesModule } from './job-sites/job-sites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { ProfilesModule } from './profiles/profiles.module';
import { QuotationsModule } from './quotations/quotations.module';
import { SubscriptionPlansModule } from './subscription-plans/subscription-plans.module';
import { UserModule } from './user/user.module';

@Global()
@Module({
    imports: [
        JobSitesModule,
        NotificationsModule,
        OrdersModule,
        ProfilesModule,
        QuotationsModule,
        SubscriptionPlansModule,
        UserModule,
    ],
    exports: [
        JobSitesModule,
        NotificationsModule,
        OrdersModule,
        ProfilesModule,
        QuotationsModule,
        SubscriptionPlansModule,
        UserModule,
    ],
})
export class ResourcesModule { } 