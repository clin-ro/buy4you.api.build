import { SchemasModule } from '@/schemas/schemas.module';
import { MailerModule } from '@/utils/mailer/mailer.module';
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [
        SchemasModule,
        MailerModule,
    ],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule { } 