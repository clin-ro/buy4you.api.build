import { Notification } from '@/schemas/mongo/notification.schema';
import { MongooseUtils } from '@/utils/mongoose/id.utils';
import { MongooseID } from '@/utils/mongoose/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { CreateNotificationDto } from './dto/notification-request.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>
    ) { }

    async create(profileId: string, createNotificationDto: CreateNotificationDto) {
        const notification = new this.notificationModel({
            ...createNotificationDto,
            profileId: MongooseUtils.toObjectId(profileId),
            read: false
        });
        return notification.save();
    }

    async findAll(profileId: string, query: NotificationQueryDto) {
        const mongoQuery: any = { profileId: MongooseUtils.toObjectId(profileId) };

        if (query.type) {
            mongoQuery.type = query.type;
        }

        if (query.read !== undefined) {
            mongoQuery.read = query.read;
        }

        if (query.orderId) {
            mongoQuery.orderId = MongooseUtils.toObjectId(query.orderId);
        }

        if (query.jobSiteId) {
            mongoQuery.jobSiteId = MongooseUtils.toObjectId(query.jobSiteId);
        }

        if (query.startDate && query.endDate) {
            mongoQuery.createdAt = {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate)
            };
        }

        if (query.searchTerm) {
            mongoQuery.$or = [
                { title: { $regex: query.searchTerm, $options: 'i' } },
                { message: { $regex: query.searchTerm, $options: 'i' } }
            ];
        }

        return this.notificationModel
            .find(mongoQuery)
            .sort({ createdAt: -1 });
    }

    async findById(id: MongooseID, profileId: MongooseID) {
        const notification = await this.notificationModel.findOne({
            _id: id,
            profileId: MongooseUtils.toObjectId(profileId)
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }

    async markAsRead(id: MongooseID, profileId: MongooseID) {
        const notification = await this.findById(id, profileId);
        notification.read = true;
        return notification.save();
    }

    async markAllAsRead(profileId: string) {
        await this.notificationModel.updateMany(
            { profileId: MongooseUtils.toObjectId(profileId), read: false },
            { $set: { read: true } }
        );
    }

    async remove(id: string, profileId: string) {
        const notification = await this.findById(id, profileId);
        await notification.deleteOne();
    }

    async removeAllRead(profileId: string) {
        await this.notificationModel.deleteMany({
            profileId: MongooseUtils.toObjectId(profileId),
            read: true
        });
    }

    async createOrderNotification(profileId: string, orderId: string, type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) {
        return this.create(profileId, {
            title,
            message,
            type,
            orderId
        });
    }

    async createJobSiteNotification(profileId: string, jobSiteId: string, type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) {
        return this.create(profileId, {
            title,
            message,
            type,
            jobSiteId
        });
    }
} 