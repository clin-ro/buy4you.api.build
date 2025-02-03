import { Order, OrderStatus } from '@/schemas/mongo/order.schema';
import { Profile } from '@/schemas/mongo/profile.schema';
import { Quotation } from '@/schemas/mongo/quotation.schema';
import { SupplierCompany } from '@/schemas/mongo/supplier-company.schema';
import { User, UserWithTimestamps } from '@/schemas/mongo/user.schema';
import { BlockUserDto, DashboardStatsDto, UserQueryDto, UserResponseDto, VerifyUserDto } from '@/swagger/admin.dto';
import { MailerService } from '@/utils/mailer/mailer.service';
import { StripeService } from '@/utils/stripe/stripe.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as os from 'os';
import { AuditLogResponseDto, SystemHealthResponseDto, TransactionStatsResponseDto, UserStatsResponseDto } from './dto/admin-response.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Profile.name) private profileModel: Model<Profile>,
        @InjectModel(Quotation.name) private quotationModel: Model<Quotation>,
        @InjectModel(User.name) private userModel: Model<UserWithTimestamps>,
        @InjectModel(SupplierCompany.name) private supplierCompanyModel: Model<SupplierCompany>,
        private readonly mailerService: MailerService,
        private readonly stripeService: StripeService
    ) { }

    async getDashboardStats(startDate?: Date, endDate?: Date): Promise<DashboardStatsDto> {
        const dateMatch: Record<string, any> = {};
        if (startDate && endDate) {
            dateMatch.createdAt = {
                $gte: startDate,
                $lte: endDate,
            };
        }

        const [orderStats, profileStats, quotationStats] = await Promise.all([
            this.getOrderStats(dateMatch),
            this.getProfileStats(dateMatch),
            this.getQuotationStats(dateMatch),
        ]);

        const typeCounts = profileStats.typeCounts || {};
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setDate(1);
        const lastMonthEnd = new Date();
        lastMonthEnd.setDate(0);

        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        const thisMonthEnd = new Date();

        const [lastMonthRevenue, thisMonthRevenue] = await Promise.all([
            this.getMonthlyRevenue(lastMonthStart, lastMonthEnd),
            this.getMonthlyRevenue(thisMonthStart, thisMonthEnd)
        ]);

        const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        return {
            orders: orderStats,
            quotations: quotationStats,
            users: {
                total: profileStats.total,
                buyers: typeCounts['buyer'] || 0,
                suppliers: typeCounts['supplier'] || 0,
                new: profileStats.verifiedCount || 0
            },
            revenue: {
                total: orderStats.total || 0,
                lastMonth: lastMonthRevenue,
                thisMonth: thisMonthRevenue,
                growth
            }
        };
    }

    private async getOrderStats(dateMatch: Record<string, any>) {
        const stats = await this.orderModel.aggregate([
            { $match: dateMatch },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    statusCounts: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    revenue: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$total' },
                                average: { $avg: '$total' },
                            },
                        },
                    ],
                },
            },
        ]);

        const result = stats[0];
        const statusCounts = this.formatStatusCounts(result.statusCounts);

        return {
            total: result.total[0]?.count || 0,
            pending: statusCounts['pending'] || 0,
            completed: statusCounts['completed'] || 0,
            cancelled: statusCounts['cancelled'] || 0
        };
    }

    private async getProfileStats(dateMatch: Record<string, any>) {
        const stats = await this.profileModel.aggregate([
            { $match: dateMatch },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    typeCounts: [
                        {
                            $group: {
                                _id: '$type',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    verifiedCount: [
                        {
                            $match: { isVerified: true },
                        },
                        { $count: 'count' },
                    ],
                },
            },
        ]);

        const result = stats[0];
        return {
            total: result.total[0]?.count || 0,
            typeCounts: this.formatStatusCounts(result.typeCounts),
            verifiedCount: result.verifiedCount[0]?.count || 0,
        };
    }

    private async getQuotationStats(dateMatch: Record<string, any>) {
        const stats = await this.quotationModel.aggregate([
            { $match: dateMatch },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    statusCounts: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    averageAmount: [
                        {
                            $group: {
                                _id: null,
                                average: { $avg: '$totalAmount' },
                            },
                        },
                    ],
                },
            },
        ]);

        const result = stats[0];
        const statusCounts = this.formatStatusCounts(result.statusCounts);

        return {
            total: result.total[0]?.count || 0,
            pending: statusCounts['pending'] || 0,
            accepted: statusCounts['accepted'] || 0,
            rejected: statusCounts['rejected'] || 0
        };
    }

    private formatStatusCounts(counts: Array<{ _id: string; count: number }>) {
        return counts.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {} as Record<string, number>);
    }

    async getAllUsers(query: UserQueryDto): Promise<UserResponseDto[]> {
        // Implementation
        return [];
    }

    async getUserById(id: string): Promise<UserResponseDto> {
        // Implementation
        return {} as UserResponseDto;
    }

    async verifyUser(id: string, verifyDto: VerifyUserDto): Promise<UserResponseDto> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const profile = await this.profileModel.findOne({ userId: user._id });
        if (!profile) {
            throw new NotFoundException('User profile not found');
        }

        user.isVerified = verifyDto.isVerified;
        profile.isVerified = verifyDto.isVerified;

        if (verifyDto.isVerified) {
            await this.mailerService.sendWelcomeEmail(
                user.email,
                `${user.firstName} ${user.lastName}`,
                'Your account has been verified'
            );
        }

        await Promise.all([user.save(), profile.save()]);

        return {
            _id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            roles: user.roles,
            isVerified: user.isVerified,
            isBlocked: user.isBlocked,
            isActive: user.isActive,
            canManageOwnOrders: user.canManageOwnOrders,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async blockUser(id: string, blockDto: BlockUserDto): Promise<UserResponseDto> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isBlocked = blockDto.isBlocked;
        user.isActive = !blockDto.isBlocked;
        await user.save();

        return {
            _id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            roles: user.roles,
            isVerified: user.isVerified,
            isBlocked: user.isBlocked,
            isActive: user.isActive,
            canManageOwnOrders: user.canManageOwnOrders,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async setOrderSelfManagement(userId: string, canManageOwnOrders: boolean): Promise<UserResponseDto> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.canManageOwnOrders = canManageOwnOrders;
        await user.save();

        return {
            _id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            roles: user.roles,
            isVerified: user.isVerified,
            isBlocked: user.isBlocked,
            isActive: user.isActive,
            canManageOwnOrders: user.canManageOwnOrders,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async routeOrderToSuppliers(orderId: string, supplierIds: string[]): Promise<Order> {
        const order = await this.orderModel.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new ConflictException('Order must be in pending status to be routed');
        }

        const suppliers = await this.supplierCompanyModel
            .find({ _id: { $in: supplierIds.map(id => new Types.ObjectId(id)) } })
            .select('contact');

        if (suppliers.length !== supplierIds.length) {
            throw new NotFoundException('One or more suppliers not found');
        }

        order.invitedSuppliers = suppliers.map(supplier => supplier._id);
        order.status = OrderStatus.PENDING_QUOTATIONS;
        order.statusHistory.push({
            status: OrderStatus.PENDING_QUOTATIONS,
            timestamp: new Date(),
            notes: `Order routed to ${suppliers.length} suppliers`
        });

        // Send email notifications to suppliers
        for (const supplier of suppliers) {
            await this.mailerService.sendQuotationRequestEmail(
                supplier.contact.email,
                supplier.contact.name,
                order.profileId.toString(),
                order._id.toString(),
                order.items
            );
        }

        return order.save();
    }

    async getUserStats(): Promise<UserStatsResponseDto> {
        // Implementation
        return {
            totalUsers: 0,
            activeUsers: 0,
            newUsersThisMonth: 0,
            usersByRole: {}
        };
    }

    async getTransactionStats(): Promise<TransactionStatsResponseDto> {
        // Implementation
        return {
            totalTransactions: 0,
            totalRevenue: 0,
            averageTransactionValue: 0,
            transactionsThisMonth: 0,
            revenueThisMonth: 0
        };
    }

    async getSystemHealth(): Promise<SystemHealthResponseDto> {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        return {
            status: 'healthy',
            uptime: process.uptime(),
            memoryUsage: {
                total: totalMem,
                used: usedMem,
                free: freeMem
            },
            cpuLoad: os.loadavg()[0]
        };
    }

    async getAuditLogs(page: number, limit: number): Promise<AuditLogResponseDto[]> {
        // Implementation
        return [];
    }

    private async getMonthlyRevenue(startDate: Date, endDate: Date): Promise<number> {
        const result = await this.orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                }
            }
        ]);

        return result[0]?.total || 0;
    }

    async updateOrderPaymentRequirement(profileId: string, requirePayment: boolean) {
        const profile = await this.profileModel.findById(profileId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        if (!profile.preferences) {
            profile.preferences = {
                emailNotifications: {
                    order_created: true,
                    order_updated: true,
                    order_completed: true,
                    quotation_created: true,
                    quotation_updated: true,
                    quotation_completed: true,
                    subscription_updated: true,
                    payment_failed: true,
                },
                requireOrderPayment: false,
                allowSelfManagedOrders: false,
                preferredSuppliers: [],
                customPreferences: {},
            };
        }

        profile.preferences.requireOrderPayment = requirePayment;
        await profile.save();

        return profile;
    }

    async getOrderPaymentRequirement(profileId: string): Promise<boolean> {
        const profile = await this.profileModel.findById(profileId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        return profile.preferences?.requireOrderPayment ?? false;
    }
} 