import { LlmModule } from '@/utils/llm/llm.module';
import { MailerModule } from '@/utils/mailer/mailer.module';
import { MapboxModule } from '@/utils/mapbox/mapbox.module';
import { MinioModule } from '@/utils/minio/minio.module';
import { NotificationsModule } from '@/utils/notifications/notifications.module';
import { StripeModule } from '@/utils/stripe/stripe.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        MailerModule,
        MinioModule,
        NotificationsModule,
        StripeModule,
        LlmModule,
        MapboxModule,
    ],
    exports: [
        MailerModule,
        MinioModule,
        NotificationsModule,
        StripeModule,
        LlmModule,
        MapboxModule,
    ],
})
export class UtilsModule { } 