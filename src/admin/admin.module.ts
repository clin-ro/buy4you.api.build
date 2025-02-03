import { AdminController } from '@/admin/admin.controller';
import { AdminService } from '@/admin/admin.service';
import { MailerModule } from '@/utils/mailer/mailer.module';
import { StripeModule } from '@/utils/stripe/stripe.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [MailerModule, StripeModule],
    providers: [AdminService],
    controllers: [AdminController],
})
export class AdminModule { } 