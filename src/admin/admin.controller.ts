import { AdminService } from '@/admin/admin.service';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/enums/role.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { OrderResponseDto } from '@/resources/orders/dto/order-response.dto';
import { UpdateOrderStatusDto } from '@/resources/orders/dto/order.dto';
import { OrdersService } from '@/resources/orders/orders.service';
import { ProfilesService } from '@/resources/profiles/profiles.service';
import { QuotationResponseDto } from '@/resources/quotations/dto/quotation-response.dto';
import { QuotationsService } from '@/resources/quotations/quotations.service';
import { SubscriptionPlanResponseDto } from '@/resources/subscription-plans/dto/subscription-plan-response.dto';
import { CreateSubscriptionPlanDto, ToggleSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '@/resources/subscription-plans/dto/subscription-plan.dto';
import { SubscriptionPlansService } from '@/resources/subscription-plans/subscription-plans.service';
import { BlockUserDto, DashboardQueryDto, DashboardStatsDto, UserQueryDto, UserResponseDto, VerifyUserDto } from '@/swagger/admin.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogResponseDto, SystemHealthResponseDto, TransactionStatsResponseDto, UserStatsResponseDto } from './dto/admin-response.dto';

const ADMIN_PROFILE_ID = 'admin';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly ordersService: OrdersService,
        private readonly profilesService: ProfilesService,
        private readonly quotationsService: QuotationsService,
        private readonly subscriptionPlansService: SubscriptionPlansService,
    ) { }

    //#region Dashboard
    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    @ApiResponse({ status: 200, type: DashboardStatsDto })
    async getDashboardStats(@Query() query: DashboardQueryDto) {
        const start = query.startDate ? new Date(query.startDate) : undefined;
        const end = query.endDate ? new Date(query.endDate) : undefined;
        return this.adminService.getDashboardStats(start, end);
    }
    //#endregion

    //#region Orders Management
    @Get('orders')
    @ApiOperation({ summary: 'Get all orders' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    @ApiResponse({ status: 200, type: [OrderResponseDto] })
    async getAllOrders(
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.ordersService.search(ADMIN_PROFILE_ID, ADMIN_PROFILE_ID, status, start, end);
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    async getOrderById(@Param('id') id: string) {
        return this.ordersService.findById(id, ADMIN_PROFILE_ID);
    }

    @Put('orders/:id/status')
    @ApiOperation({ summary: 'Update order status' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    async updateOrderStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.update(id, updateStatusDto, ADMIN_PROFILE_ID);
    }

    @Delete('orders/:id')
    @ApiOperation({ summary: 'Delete order' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 204 })
    async deleteOrder(@Param('id') id: string): Promise<void> {
        await this.ordersService.remove(id, ADMIN_PROFILE_ID);
    }
    //#endregion

    //#region Quotations Management
    @Get('quotations')
    @ApiOperation({ summary: 'Get all quotations' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    @ApiResponse({ status: 200, type: [QuotationResponseDto] })
    async getAllQuotations(
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.quotationsService.findAll(ADMIN_PROFILE_ID);
    }

    @Get('quotations/:id')
    @ApiOperation({ summary: 'Get quotation by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: QuotationResponseDto })
    async getQuotationById(@Param('id') id: string) {
        return this.quotationsService.findById(id, ADMIN_PROFILE_ID);
    }

    @Put('quotations/:id/status')
    @ApiOperation({ summary: 'Update quotation status' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: QuotationResponseDto })
    async updateQuotationStatus(
        @Param('id') id: string,
        @Body('status') status: string,
    ) {
        return this.quotationsService.updateStatus(id, { status } as any);
    }

    @Delete('quotations/:id')
    @ApiOperation({ summary: 'Delete quotation' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 204 })
    async deleteQuotation(@Param('id') id: string): Promise<void> {
        await this.quotationsService.remove(id, ADMIN_PROFILE_ID);
    }
    //#endregion

    //#region Subscription Plans Management
    @Get('subscription-plans')
    @ApiOperation({ summary: 'Get all subscription plans' })
    @ApiResponse({ status: 200, type: [SubscriptionPlanResponseDto] })
    async getAllSubscriptionPlans() {
        return this.subscriptionPlansService.findAll();
    }

    @Get('subscription-plans/:id')
    @ApiOperation({ summary: 'Get subscription plan by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: SubscriptionPlanResponseDto })
    async getSubscriptionPlanById(@Param('id') id: string) {
        return this.subscriptionPlansService.findById(id);
    }

    @Post('subscription-plans')
    @ApiOperation({ summary: 'Create subscription plan' })
    @ApiResponse({ status: 201, type: SubscriptionPlanResponseDto })
    async createSubscriptionPlan(@Body() createPlanDto: CreateSubscriptionPlanDto) {
        return this.subscriptionPlansService.create(createPlanDto);
    }

    @Put('subscription-plans/:id')
    @ApiOperation({ summary: 'Update subscription plan' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: SubscriptionPlanResponseDto })
    async updateSubscriptionPlan(
        @Param('id') id: string,
        @Body() updatePlanDto: UpdateSubscriptionPlanDto,
    ) {
        return this.subscriptionPlansService.update(id, updatePlanDto);
    }

    @Put('subscription-plans/:id/toggle-active')
    @ApiOperation({ summary: 'Toggle subscription plan active status' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: SubscriptionPlanResponseDto })
    async toggleSubscriptionPlanActive(
        @Param('id') id: string,
        @Body() toggleDto: ToggleSubscriptionPlanDto,
    ) {
        return this.subscriptionPlansService.toggleActive(id, toggleDto.isActive);
    }

    @Delete('subscription-plans/:id')
    @ApiOperation({ summary: 'Delete subscription plan' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 204 })
    async deleteSubscriptionPlan(@Param('id') id: string): Promise<void> {
        await this.subscriptionPlansService.remove(id);
    }
    //#endregion

    //#region User Management
    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    async getAllUsers(@Query() query: UserQueryDto) {
        return this.adminService.getAllUsers(query);
    }

    @Get('users/:id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async getUserById(@Param('id') id: string) {
        return this.adminService.getUserById(id);
    }

    @Put('users/:id/verify')
    @ApiOperation({ summary: 'Verify user' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async verifyUser(
        @Param('id') id: string,
        @Body() verifyDto: VerifyUserDto
    ) {
        return this.adminService.verifyUser(id, verifyDto);
    }

    @Put('users/:id/block')
    @ApiOperation({ summary: 'Block user' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async blockUser(
        @Param('id') id: string,
        @Body() blockDto: BlockUserDto
    ) {
        return this.adminService.blockUser(id, blockDto);
    }
    //#endregion

    @Get('stats/users')
    @ApiOperation({ summary: 'Get user statistics' })
    @ApiResponse({ status: 200, type: UserStatsResponseDto })
    async getUserStats() {
        return this.adminService.getUserStats();
    }

    @Get('stats/transactions')
    @ApiOperation({ summary: 'Get transaction statistics' })
    @ApiResponse({ status: 200, type: TransactionStatsResponseDto })
    async getTransactionStats() {
        return this.adminService.getTransactionStats();
    }

    @Get('system/health')
    @ApiOperation({ summary: 'Get system health status' })
    @ApiResponse({ status: 200, type: SystemHealthResponseDto })
    async getSystemHealth() {
        return this.adminService.getSystemHealth();
    }

    @Get('audit-logs')
    @ApiOperation({ summary: 'Get audit logs' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, type: [AuditLogResponseDto] })
    async getAuditLogs(
        @Query('page') page = 1,
        @Query('limit') limit = 10
    ) {
        return this.adminService.getAuditLogs(page, limit);
    }
} 