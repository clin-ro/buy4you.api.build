import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReactAdapter } from '@webtre/nestjs-mailer-react-adapter';
import { join } from 'path';
import { MailerService } from './mailer.service';

@Module({
    imports: [
        NestMailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get('SMTP_HOST'),
                    port: parseInt(config.get('SMTP_PORT') || '587'),
                    secure: config.get('SMTP_SECURE') === 'true',
                    auth: {
                        user: config.get('SMTP_USER'),
                        pass: config.get('SMTP_PASS'),
                    },
                },
                defaults: {
                    from: config.get('SMTP_FROM'),
                },
                template: {
                    adapter: new ReactAdapter(),
                    dir: join(__dirname, 'templates'),
                },
            }),
        }),
    ],
    providers: [MailerService],
    exports: [MailerService],
})
export class MailerModule { } 