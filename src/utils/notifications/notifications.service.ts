import { NotificationQueryDto } from '@/resources/notifications/dto/notification-query.dto';
import { Notification, NotificationType } from '@/schemas/mongo/notification.schema';
import { Profile } from '@/schemas/mongo/profile.schema';
import { MailerService } from '@/utils/mailer/mailer.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(Profile.name) private profileModel: Model<Profile>,
        private readonly mailerService: MailerService,
    ) { }

    async create(userId: string, type: NotificationType, title: string, message: string, metadata?: any) {
        const notification = new this.notificationModel({
            userId: new Types.ObjectId(userId),
            type,
            title,
            message,
            metadata,
            read: false
        });
        return notification.save();
    }

    async findAll(userId: string, query: NotificationQueryDto) {
        const mongoQuery: any = { userId: new Types.ObjectId(userId) };

        if (query.type) {
            mongoQuery.type = query.type;
        }

        if (query.read !== undefined) {
            mongoQuery.read = query.read;
        }

        if (query.orderId) {
            mongoQuery['metadata.orderId'] = new Types.ObjectId(query.orderId);
        }

        if (query.jobSiteId) {
            mongoQuery['metadata.jobSiteId'] = new Types.ObjectId(query.jobSiteId);
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

    async findById(id: string, userId: string) {
        const notification = await this.notificationModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId)
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }

    async markAsRead(id: string, userId: string) {
        await this.notificationModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            },
            { $set: { read: true } },
            { new: true }
        );
    }

    async markAllAsRead(userId: string) {
        await this.notificationModel.updateMany(
            { userId: new Types.ObjectId(userId), read: false },
            { $set: { read: true } }
        );
    }

    async remove(id: string, userId: string) {
        const notification = await this.findById(id, userId);
        await notification.deleteOne();
    }

    async removeAllRead(userId: string) {
        await this.notificationModel.deleteMany({
            userId: new Types.ObjectId(userId),
            read: true
        });
    }

    async createOrderNotification(userId: string, orderId: string, type: NotificationType, title: string, message: string) {
        return this.create(userId, type, title, message, {
            orderId: new Types.ObjectId(orderId)
        });
    }

    async createJobSiteNotification(userId: string, jobSiteId: string, type: NotificationType, title: string, message: string) {
        return this.create(userId, type, title, message, {
            jobSiteId: new Types.ObjectId(jobSiteId)
        });
    }

    async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
        return this.notificationModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);
    }

    async getUnreadCount(userId: string) {
        return this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), read: false });
    }

    private async sendEmail(notification: Notification, profile: Profile) {
        if (!profile?.email) {
            return;
        }

        const recipientName = profile.type === 'company'
            ? profile.companyDetails?.mainContactName
            : profile.individualDetails?.fullName;

        if (!recipientName) {
            return;
        }

        switch (notification.type) {
            case NotificationType.PROFILE_REVIEW:
            case NotificationType.PROFILE_STATUS:
                await this.mailerService.sendProfileStatusEmail(
                    profile.email,
                    recipientName,
                    notification.data.status,
                    profile.type as 'company' | 'individual',
                    notification.data.reason
                );
                break;

            case NotificationType.ORDER_CREATED:
            case NotificationType.ORDER_STATUS:
            case NotificationType.SHIPPING_UPDATE:
            case NotificationType.DELIVERY_CONFIRMATION:
                await this.mailerService.sendOrderStatusEmail(
                    profile.email,
                    notification.data.orderNumber,
                    recipientName,
                    notification.data.status,
                    notification.data.items,
                    notification.data.total,
                    notification.data.shippingAddress
                );
                break;

            case NotificationType.QUOTATION_SUBMITTED:
            case NotificationType.QUOTATION_STATUS:
                await this.mailerService.sendQuotationStatusEmail(
                    profile.email,
                    notification.data.quotationId,
                    recipientName,
                    notification.data.status,
                    notification.data.items,
                    notification.data.total,
                    notification.data.comments
                );
                break;

            case NotificationType.JOB_SITE_INVITATION:
            case NotificationType.JOB_SITE_UPDATE:
                await this.mailerService.sendJobSiteInvitationEmail(
                    profile.email,
                    notification.data.inviterName,
                    notification.data.jobSiteName,
                    notification.data.invitationCode
                );
                break;

            case NotificationType.PAYMENT_STATUS:
                await this.mailerService.sendPaymentStatusEmail(
                    profile.email,
                    recipientName,
                    notification.data.status,
                    notification.data.amount,
                    notification.data.orderId,
                    notification.data.subscriptionId
                );
                break;

            case NotificationType.SUBSCRIPTION_STATUS:
                await this.mailerService.sendSubscriptionStatusEmail(
                    profile.email,
                    recipientName,
                    notification.data.status,
                    notification.data.planName,
                    notification.data.nextBillingDate,
                    notification.data.amount
                );
                break;
        }

        notification.emailSentAt = new Date();
        await notification.save();
    }
} 