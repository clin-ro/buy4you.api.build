import { OrderQueryDto, QuotationQueryDto, SearchQueryDto } from '@/resources/buyers/dto/buyer-query.dto';
import { AddBuyerToJobSiteRequestDto, CreateOrderRequestDto, CreateQuotationRequestDto, UpdateOrderStatusRequestDto, UpdateQuotationStatusRequestDto } from '@/resources/buyers/dto/buyer-request.dto';
import { UpdateProfileRequestDto } from '@/resources/profiles/dto/profile-request.dto';
import { JobSite } from '@/schemas/mongo/job-site.schema';
import { Notification, NotificationType } from '@/schemas/mongo/notification.schema';
import { Order, OrderStatus } from '@/schemas/mongo/order.schema';
import { Profile, SubscriptionUsage } from '@/schemas/mongo/profile.schema';
import { Quotation, QuotationStatus } from '@/schemas/mongo/quotation.schema';
import { SubscriptionPlan } from '@/schemas/mongo/subscription-plan.schema';
import { NotificationsService } from '@/utils/notifications/notifications.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class BuyerService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Profile.name) private profileModel: Model<Profile>,
        @InjectModel(Quotation.name) private quotationModel: Model<Quotation>,
        @InjectModel(JobSite.name) private jobSiteModel: Model<JobSite>,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(SubscriptionPlan.name) private subscriptionPlanModel: Model<SubscriptionPlan>,
        private readonly notificationsService: NotificationsService,
    ) { }

    //#region Job Sites
    async findJobSites(userId: string) {
        return this.jobSiteModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 });
    }

    async searchJobSites(userId: string, query: SearchQueryDto) {
        const mongoQuery: any = { userId: new Types.ObjectId(userId) };

        if (query.term) {
            mongoQuery.$or = [
                { name: { $regex: query.term, $options: 'i' } },
                { address: { $regex: query.term, $options: 'i' } }
            ];
        }

        if (query.status) {
            mongoQuery.status = query.status;
        }

        if (query.contactName) {
            mongoQuery.contactName = { $regex: query.contactName, $options: 'i' };
        }

        if (query.contactPhone) {
            mongoQuery.contactPhone = { $regex: query.contactPhone, $options: 'i' };
        }

        if (query.startDate && query.endDate) {
            mongoQuery.createdAt = {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate),
            };
        }

        return this.jobSiteModel
            .find(mongoQuery)
            .sort({ createdAt: -1 });
    }

    async findJobSiteById(id: string, userId: string) {
        const jobSite = await this.jobSiteModel
            .findOne({
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            });

        if (!jobSite) {
            throw new NotFoundException('Job site not found');
        }

        return jobSite;
    }

    async addBuyerToJobSite(id: string, addBuyerDto: AddBuyerToJobSiteRequestDto, userId: string) {
        const jobSite = await this.findJobSiteById(id, userId);

        if (jobSite.buyers.includes(new Types.ObjectId(addBuyerDto.buyerId))) {
            return jobSite;
        }

        jobSite.buyers.push(new Types.ObjectId(addBuyerDto.buyerId));
        await jobSite.save();

        return jobSite;
    }

    async createInvitation(id: string, userId: string, expirationHours: number = 72) {
        const jobSite = await this.findJobSiteById(id, userId);

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expirationHours);

        const invitation = {
            jobSiteId: jobSite._id,
            token: Math.random().toString(36).substring(2),
            expiresAt,
        };

        // TODO: Save invitation to database
        return invitation;
    }
    //#endregion

    //#region Orders
    async findOrders(userId: string, query: OrderQueryDto) {
        const mongoQuery: any = { userId: new Types.ObjectId(userId) };

        if (query.status) {
            mongoQuery.status = query.status;
        }

        if (query.jobSiteId) {
            mongoQuery.jobSiteId = new Types.ObjectId(query.jobSiteId);
        }

        if (query.quotationId) {
            mongoQuery.$or = [
                { quotations: new Types.ObjectId(query.quotationId) },
                { selectedQuotationId: new Types.ObjectId(query.quotationId) }
            ];
        }

        if (query.startDate && query.endDate) {
            mongoQuery.createdAt = {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate),
            };
        }

        if (query.searchTerm) {
            mongoQuery.$or = [
                { 'items.name': { $regex: query.searchTerm, $options: 'i' } },
                { notes: { $regex: query.searchTerm, $options: 'i' } }
            ];
        }

        if (query.minTotalPrice || query.maxTotalPrice) {
            mongoQuery.totalPrice = {};
            if (query.minTotalPrice) mongoQuery.totalPrice.$gte = query.minTotalPrice;
            if (query.maxTotalPrice) mongoQuery.totalPrice.$lte = query.maxTotalPrice;
        }

        return this.orderModel
            .find(mongoQuery)
            .sort({ createdAt: -1 })
            .populate([
                {
                    path: 'jobSiteId',
                    model: 'JobSite'
                },
                {
                    path: 'quotations',
                    model: 'Quotation'
                },
                {
                    path: 'selectedQuotationId',
                    model: 'Quotation'
                }
            ]);
    }

    async getQuickLookups(userId: string) {
        const [
            totalOrders,
            pendingOrders,
            shippedOrders,
            completedOrders,
            totalAmount
        ] = await Promise.all([
            this.orderModel.countDocuments({ userId: new Types.ObjectId(userId) }),
            this.orderModel.countDocuments({ userId: new Types.ObjectId(userId), status: 'pending' }),
            this.orderModel.countDocuments({ userId: new Types.ObjectId(userId), status: 'shipped' }),
            this.orderModel.countDocuments({ userId: new Types.ObjectId(userId), status: 'completed' }),
            this.orderModel.aggregate([
                { $match: { userId: new Types.ObjectId(userId) } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]).then(result => result[0]?.total || 0)
        ]);

        return [
            {
                title: 'Total Orders',
                value: totalOrders,
                change: 0, // TODO: Calculate change from previous period
                type: 'increase'
            },
            {
                title: 'Pending Orders',
                value: pendingOrders,
                change: 0,
                type: 'neutral'
            },
            {
                title: 'Shipped Orders',
                value: shippedOrders,
                change: 0,
                type: 'increase'
            },
            {
                title: 'Completed Orders',
                value: completedOrders,
                change: 0,
                type: 'increase'
            },
            {
                title: 'Total Amount',
                value: totalAmount,
                change: 0,
                type: 'increase',
                prefix: '$'
            }
        ];
    }

    async findOrderById(id: string, userId: string) {
        const order = await this.orderModel
            .findOne({
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            })
            .populate([
                {
                    path: 'jobSiteId',
                    model: 'JobSite'
                },
                {
                    path: 'quotations',
                    model: 'Quotation'
                },
                {
                    path: 'selectedQuotationId',
                    model: 'Quotation'
                }
            ]);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async createOrder(createOrderDto: CreateOrderRequestDto, userId: string) {
        const profile = await this.profileModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        const subscriptionInfo = {
            ordersUsed: profile.subscriptionUsage?.ordersUsed || 0,
            includedOrders: profile.subscription?.includedOrders || 0
        };

        // Verify jobSite exists and belongs to user
        const jobSite = await this.jobSiteModel.findOne({
            _id: new Types.ObjectId(createOrderDto.jobSiteId),
            userId: new Types.ObjectId(userId)
        });

        if (!jobSite) {
            throw new NotFoundException('Job site not found');
        }

        const order = await this.orderModel.create({
            ...createOrderDto,
            profileId: profile._id,
            userId: new Types.ObjectId(userId),
            jobSiteId: new Types.ObjectId(createOrderDto.jobSiteId),
            status: OrderStatus.PENDING,
            isSelfManaged: false,
            quotations: [],
            items: createOrderDto.items.map(item => ({
                ...item,
                unitPrice: 0,
                totalPrice: 0,
                deliveredQuantity: 0
            })),
            subtotal: 0,
            tax: 0,
            total: 0,
            requiredDeliveryDate: new Date(),
            statusHistory: [{
                status: OrderStatus.PENDING,
                timestamp: new Date(),
                notes: 'Order created'
            }]
        });

        // Create notification
        await this.notificationsService.createOrderNotification(
            userId,
            order._id.toString(),
            NotificationType.SUCCESS,
            'Order Created Successfully',
            'Your order has been created and is pending review.'
        );

        return order.populate([
            {
                path: 'jobSiteId',
                model: 'JobSite'
            },
            {
                path: 'quotations',
                model: 'Quotation'
            },
            {
                path: 'selectedQuotationId',
                model: 'Quotation'
            }
        ]);
    }

    async updateOrderStatus(id: string, updateStatusDto: UpdateOrderStatusRequestDto, userId: string) {
        const order = await this.findOrderById(id, userId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        order.status = updateStatusDto.status as OrderStatus;
        order.statusHistory.push({
            status: updateStatusDto.status as OrderStatus,
            timestamp: new Date(),
            notes: `Status updated to ${updateStatusDto.status}`
        });

        await order.save();

        // Create notification
        await this.notificationsService.createOrderNotification(
            userId,
            order._id.toString(),
            NotificationType.INFO,
            'Order Status Updated',
            `Order status has been updated to ${updateStatusDto.status}.`
        );

        return order.populate([
            {
                path: 'jobSiteId',
                model: 'JobSite'
            },
            {
                path: 'quotations',
                model: 'Quotation'
            },
            {
                path: 'selectedQuotationId',
                model: 'Quotation'
            }
        ]);
    }
    //#endregion

    //#region Quotations
    async findQuotations(userId: string, query: QuotationQueryDto) {
        const mongoQuery: any = { userId: new Types.ObjectId(userId) };

        if (query.status) {
            mongoQuery.status = query.status;
        }

        if (query.jobSiteId) {
            mongoQuery.jobSiteId = new Types.ObjectId(query.jobSiteId);
        }

        if (query.supplierId) {
            mongoQuery.invitedSuppliers = new Types.ObjectId(query.supplierId);
        }

        if (query.startDate && query.endDate) {
            mongoQuery.createdAt = {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate),
            };
        }

        if (query.searchTerm) {
            mongoQuery.$or = [
                { 'items.name': { $regex: query.searchTerm, $options: 'i' } },
                { notes: { $regex: query.searchTerm, $options: 'i' } }
            ];
        }

        return this.quotationModel
            .find(mongoQuery)
            .sort({ createdAt: -1 })
            .populate([
                {
                    path: 'jobSite',
                    model: 'JobSite'
                },
                {
                    path: 'selectedSupplierId',
                    model: 'Quotation'
                }
            ]);
    }

    async findQuotationById(id: string, userId: string) {
        return this.quotationModel
            .findOne({
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            })
            .populate([
                {
                    path: 'jobSite',
                    model: 'JobSite'
                },
                {
                    path: 'selectedSupplierId',
                    model: 'Quotation'
                }
            ]);
    }

    async createQuotation(createQuotationDto: CreateQuotationRequestDto, userId: string) {
        const quotation = new this.quotationModel({
            ...createQuotationDto,
            userId: new Types.ObjectId(userId),
            jobSiteId: new Types.ObjectId(createQuotationDto.jobSiteId),
            status: QuotationStatus.DRAFT,
            invitedSuppliers: createQuotationDto.invitedSuppliers.map(id => new Types.ObjectId(id)),
            items: createQuotationDto.items.map(item => ({
                ...item,
                unitPrice: 0,
                totalPrice: 0,
                deliveredQuantity: 0
            }))
        });

        await quotation.save();

        // Create notification
        await this.notificationsService.createJobSiteNotification(
            userId,
            quotation.jobSiteId.toString(),
            NotificationType.SUCCESS,
            'Quotation Created Successfully',
            'Your quotation has been created and is in draft status.'
        );

        return quotation;
    }

    async updateQuotationStatus(id: string, updateStatusDto: UpdateQuotationStatusRequestDto, userId: string) {
        const quotation = await this.findQuotationById(id, userId);
        if (!quotation) {
            throw new NotFoundException('Quotation not found');
        }

        quotation.status = updateStatusDto.status as QuotationStatus;
        await quotation.save();

        // Create notification
        await this.notificationsService.createJobSiteNotification(
            userId,
            quotation.jobSiteId.toString(),
            NotificationType.INFO,
            'Quotation Status Updated',
            `Quotation status has been updated to ${updateStatusDto.status}.`
        );

        return quotation;
    }
    //#endregion

    //#region Profile
    async findProfile(userId: string) {
        const profile = await this.profileModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .populate({
                path: 'subscription.plan',
                model: 'SubscriptionPlan'
            });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        return profile;
    }

    async updateProfile(userId: string, updateData: UpdateProfileRequestDto) {
        let profile = await this.profileModel.findOne({ userId: new Types.ObjectId(userId) });
        let isNewProfile = false;

        if (!profile) {
            isNewProfile = true;
            const defaultPlan = await this.subscriptionPlanModel.findOne({ isDefault: true, isActive: true });
            if (!defaultPlan) {
                throw new Error('No default subscription plan found');
            }

            const defaultInterval = defaultPlan.pricingIntervals.find(interval => interval.isDefault);
            if (!defaultInterval) {
                throw new Error('No default pricing interval found for the plan');
            }

            profile = new this.profileModel({
                userId: new Types.ObjectId(userId),
                ...updateData,
                type: updateData.company ? 'company' : 'individual',
                subscription: {
                    plan: defaultPlan._id,
                    status: 'active',
                    currency: defaultPlan.currency,
                    subscriptionFee: defaultInterval.price,
                    includedOrders: defaultInterval.includedOrders,
                    pricePerExtraOrder: defaultPlan.pricePerExtraOrder,
                    startDate: new Date(),
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + defaultInterval.intervalCount)),
                    cancelAtPeriodEnd: false,
                },
                subscriptionUsage: {
                    billingPeriodStart: new Date(),
                    billingPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + defaultInterval.intervalCount)),
                    ordersUsed: 0,
                    extraOrdersUsed: 0,
                    extraOrdersCost: 0,
                    currentBill: 0,
                }
            });
        } else {
            const updatedData = {
                ...updateData,
                type: updateData.company ? 'company' : 'individual'
            };
            Object.assign(profile, updatedData);
        }

        await profile.save();
        await profile.populate({
            path: 'subscription.plan',
            model: 'SubscriptionPlan'
        });

        // Create notification
        await this.notificationsService.create(
            userId,
            isNewProfile ? NotificationType.PROFILE_CREATED : NotificationType.PROFILE_UPDATED,
            isNewProfile ? 'Profile Created Successfully' : 'Profile Updated Successfully',
            isNewProfile ? 'Your profile has been created and is now under review.' : 'Your profile has been updated successfully.',
            {
                status: 'pending_review',
                type: profile.type
            }
        );

        return profile;
    }

    async updateSubscription(userId: string, planId: string) {
        const profile = await this.findProfile(userId);
        const plan = await this.subscriptionPlanModel.findById(planId);

        if (!plan) {
            throw new NotFoundException('Subscription plan not found');
        }

        // If it's the free plan, no need for Stripe integration
        if (plan.isDefault) {
            const defaultInterval = plan.pricingIntervals.find((interval: { isDefault: boolean }) => interval.isDefault);
            if (!defaultInterval) {
                throw new Error('No default pricing interval found for the plan');
            }

            const subscription = {
                plan: plan._id,
                status: 'active',
                currency: plan.currency,
                subscriptionFee: defaultInterval.price,
                includedOrders: defaultInterval.includedOrders,
                pricePerExtraOrder: plan.pricePerExtraOrder,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + defaultInterval.intervalCount)),
                cancelAtPeriodEnd: false,
            };

            profile.subscription = subscription;
            profile.subscriptionUsage = {
                billingPeriodStart: new Date(),
                billingPeriodEnd: subscription.endDate,
                ordersUsed: 0,
                extraOrdersUsed: 0,
                extraOrdersCost: 0,
                currentBill: 0,
            };

            await profile.save();
            return profile;
        }

        // TODO: Implement Stripe subscription creation
        throw new Error('Paid subscriptions not implemented yet');
    }

    async getSubscriptionUsage(userId: string): Promise<SubscriptionUsage> {
        const profile = await this.findProfile(userId);
        return profile.subscriptionUsage;
    }

    async getSubscriptionPlans() {
        return this.subscriptionPlanModel.find({ isActive: true });
    }

    async getDefaultSubscriptionPlan() {
        return this.subscriptionPlanModel.findOne({ isDefault: true, isActive: true });
    }
    //#endregion

    //#region Notifications
    async findNotifications(userId: string) {
        return this.notificationModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 });
    }

    async markNotificationAsRead(id: string, userId: string) {
        const notification = await this.notificationModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId)
            },
            { $set: { read: true } },
            { new: true }
        );

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

    }
    //#endregion
}