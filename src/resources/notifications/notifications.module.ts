import { Notification, NotificationSchema } from '@/schemas/mongo/notification.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema }
        ])
    ],
    providers: [NotificationsService],
    exports: [NotificationsService]
})
export class NotificationsModule { } 