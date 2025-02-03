import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/enums/role.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { BuyerService } from '@/buyer/buyer.service';
import {
    OrderQueryDto,
    QuotationQueryDto,
    SearchQueryDto
} from '@/resources/buyers/dto/buyer-query.dto';
import {
    AddBuyerToJobSiteRequestDto,
    CreateOrderRequestDto,
    CreateQuotationRequestDto,
    UpdateOrderStatusRequestDto,
    UpdateQuotationStatusRequestDto
} from '@/resources/buyers/dto/buyer-request.dto';
import {
    AcceptJobSiteInvitationResponseDto,
    CreateJobSiteInvitationDto,
    JobSiteInvitationResponseDto
} from '@/resources/job-sites/dto/job-site-invitation.dto';
import { JobSiteResponseDto } from '@/resources/job-sites/dto/job-site-response.dto';
import { CreateJobSiteDto, UpdateJobSiteDto } from '@/resources/job-sites/dto/job-site.dto';
import { JobSitesService } from '@/resources/job-sites/job-sites.service';
import { NotificationResponseDto } from '@/resources/notifications/dto/notification-response.dto';
import { NotificationsService } from '@/resources/notifications/notifications.service';
import { OrderItemsLLMRequestDto, OrderResponseDto } from '@/resources/orders/dto/order-response.dto';
import { UpdateOrderDto } from '@/resources/orders/dto/order.dto';
import { OrdersService } from '@/resources/orders/orders.service';
import { OrderItems, OrderItemsSchema } from '@/resources/orders/zod/order-items.zod';
import { UpdateProfileRequestDto } from '@/resources/profiles/dto/profile-request.dto';
import { ProfileResponseDto } from '@/resources/profiles/dto/profile-response.dto';
import { ProfilesService } from '@/resources/profiles/profiles.service';
import { QuotationResponseDto } from '@/resources/quotations/dto/quotation-response.dto';
import { UpdateQuotationDto } from '@/resources/quotations/dto/quotation.dto';
import { QuotationsService } from '@/resources/quotations/quotations.service';
import { SubscriptionPlansService } from '@/resources/subscription-plans/subscription-plans.service';
import { Quotation } from '@/schemas/mongo/quotation.schema';
import { LlmService } from '@/utils/llm/llm.service';
import { AddressDetails, AddressFeature, MapboxService } from '@/utils/mapbox/mapbox.service';
import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { ExtractContactResponseDto } from './dto/extract-contact.dto';

class AddressFeatureDto implements AddressFeature {
    @ApiProperty()
    id: string;

    @ApiProperty()
    type: string;

    @ApiProperty({ type: [String] })
    place_type: string[];

    @ApiProperty()
    place_name: string;

    @ApiProperty()
    text: string;

    @ApiProperty({ type: [Number] })
    center: [number, number];

    @ApiProperty({ type: Array })
    context: Array<{
        id: string;
        text: string;
    }>;
}

class AddressDetailsDto implements AddressDetails {
    @ApiProperty()
    streetAddress: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    region: string;

    @ApiProperty()
    postalCode: string;

    @ApiProperty()
    country: string;

    @ApiProperty({ type: [Number] })
    coordinates: [number, number];
}

@ApiTags('Buyer')
@ApiBearerAuth()
@Controller('buyer')
@UseGuards(JwtAuthGuard, RolesGuard, AuthGuard('jwt'))
@Roles(Role.BUYER)
export class BuyerController {
    constructor(
        private readonly jobSitesService: JobSitesService,
        private readonly notificationsService: NotificationsService,
        private readonly ordersService: OrdersService,
        private readonly quotationsService: QuotationsService,
        private readonly subscriptionPlansService: SubscriptionPlansService,
        private readonly buyerService: BuyerService,
        private readonly profilesService: ProfilesService,
        private readonly llmService: LlmService,
        @InjectModel(Quotation.name) private quotationModel: Model<Quotation>,
        private readonly mapboxService: MapboxService,
    ) { }

    //#region Profile
    @Get('profile')
    @ApiOperation({ summary: 'Get buyer profile' })
    async getProfile(@CurrentUser('userId') userId: string) {
        return this.buyerService.findProfile(userId);
    }

    @Put('profile')
    @ApiOperation({
        summary: 'Update or create buyer profile',
        description: 'Updates an existing profile or creates a new one with default subscription if it does not exist'
    })
    @ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        type: ProfileResponseDto
    })
    @ApiResponse({
        status: 201,
        description: 'Profile created successfully with default subscription',
        type: ProfileResponseDto
    })
    async updateProfile(
        @CurrentUser('userId') userId: string,
        @Body() updateProfileDto: UpdateProfileRequestDto
    ) {
        try {
            const profile = await this.buyerService.updateProfile(userId, updateProfileDto);
            return profile;
        } catch (error) {
            if (error.message === 'No default subscription plan found' ||
                error.message === 'No default pricing interval found for the plan') {
                throw new InternalServerErrorException(error.message);
            }
            throw error;
        }
    }

    @Get('subscription/usage')
    @ApiOperation({ summary: 'Get subscription usage' })
    async getSubscriptionUsage(@CurrentUser('userId') userId: string) {
        return this.buyerService.getSubscriptionUsage(userId);
    }

    @Get('subscription-plans')
    @ApiOperation({ summary: 'Get available subscription plans' })
    async getSubscriptionPlans() {
        return this.buyerService.getSubscriptionPlans();
    }

    @Put('subscription')
    @ApiOperation({ summary: 'Update subscription plan' })
    async updateSubscription(
        @CurrentUser('userId') userId: string,
        @Body('planId') planId: string
    ) {
        return this.buyerService.updateSubscription(userId, planId);
    }
    //#endregion

    //#region LLM Routes
    @Post('llm/items')
    @ApiOperation({
        summary: 'Generate order items from natural language',
        description: 'Takes a list of current items and a natural language prompt, and returns an updated list of items based on the prompt'
    })
    @ApiBody({
        type: OrderItemsLLMRequestDto,
        description: 'Current items and natural language prompt describing desired changes'
    })
    @ApiResponse({
        status: 200,
        type: OrderResponseDto,
        description: 'Order items generated successfully',
        schema: {
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', example: 'Steel Pipes' },
                            quantity: { type: 'number', example: 100 },
                            unitOfMeasure: { type: 'string', example: 'meters' },
                            unitPrice: { type: 'number', example: 50 },
                            totalPrice: { type: 'number', example: 5000 },
                            deliveredQuantity: { type: 'number', example: 0 }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid input format' })
    async generateOrderItems(
        @Body('items') items: OrderItems['items'],
        @Body('prompt') prompt: string,
    ): Promise<OrderItems | undefined> {
        const fullPrompt = `
    Current items: ${JSON.stringify(items)}
    ------------------------------------------------------------------------
    Generate new order items based on the following buyer description, keep notice of the items that are already in the current list: 
    ------------------------------------------------------------------------
    Buyer input: ${prompt}
    ------------------------------------------------------------------------
    adjust the list (add, remove, update) to match the buyer instructions.
    ------------------------------------------------------------------------
    Return the new list of items in JSON format.
    `;
        const result = await this.llmService.generateFromPrompt<OrderItems>(
            fullPrompt,
            OrderItemsSchema,
        );
        return result;
    }


    @Post('llm/contacts')
    @ApiOperation({
        summary: 'Extract contact information from an image',
        description: 'Takes a business card image and returns extracted contact information'
    })
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
                return cb(new BadRequestException('Only image files (JPEG, PNG) are allowed'), false);
            }
            cb(null, true);
        }
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Business card image file (JPEG, PNG)'
                }
            }
        }
    })
    @ApiResponse({ status: 200, type: ExtractContactResponseDto, description: 'Successfully extracted contact information' })
    @ApiResponse({ status: 400, description: 'Invalid image file or format' })
    @ApiResponse({ status: 500, description: 'Error processing image' })
    async extractContactFromImage(
        @UploadedFile() file: Express.Multer.File
    ): Promise<ExtractContactResponseDto> {
        try {
            if (!file) {
                throw new BadRequestException('No image file provided');
            }

            const imageBuffer = file.buffer;
            const result = await this.llmService.extractContactFromImage(imageBuffer, file.mimetype);
            console.log('LLM service result:', result);

            if (!result) {
                throw new BadRequestException('Failed to extract contact information from image');
            }

            const response = {
                name: result.name,
                email: result.email,
                phone: result.phone,
                title: result.title,
                department: result.department
            };
            return response;

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error processing business card image');
        }
    }
    //#endregion

    //#region Job Sites
    @Get('job-sites')
    @ApiOperation({ summary: 'Get all job sites' })
    @ApiResponse({ status: 200, type: [JobSiteResponseDto], description: 'List of job sites' })
    async getJobSites(@CurrentUser('userId') userId: string) {
        return this.jobSitesService.findAll(userId);
    }

    @Post('job-sites')
    @ApiOperation({ summary: 'Create new job site' })
    @ApiBody({ type: CreateJobSiteDto })
    @ApiResponse({ status: 201, type: JobSiteResponseDto, description: 'Job site created successfully' })
    async createJobSite(
        @CurrentUser('userId') userId: string,
        @Body() createJobSiteDto: CreateJobSiteDto
    ) {
        return this.jobSitesService.create(createJobSiteDto, userId).catch(error => {
            console.log(error);
            throw new InternalServerErrorException(error.message);
        });
    }

    @Get('job-sites/search')
    @ApiOperation({ summary: 'Search job sites' })
    @ApiResponse({ status: 200, type: [JobSiteResponseDto], description: 'List of job sites matching search criteria' })
    async searchJobSites(
        @CurrentUser('userId') userId: string,
        @Query() query: SearchQueryDto
    ) {
        return this.jobSitesService.search(userId, query);
    }

    @Get('job-sites/:id')
    @ApiOperation({ summary: 'Get job site by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job site ID' })
    @ApiResponse({ status: 200, type: JobSiteResponseDto, description: 'Job site details' })
    @ApiResponse({ status: 404, description: 'Job site not found' })
    async getJobSiteById(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        return this.jobSitesService.findById(id, userId);
    }

    @Put('job-sites/:id')
    @ApiOperation({ summary: 'Update job site' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job site ID' })
    @ApiBody({ type: UpdateJobSiteDto })
    @ApiResponse({ status: 200, type: JobSiteResponseDto, description: 'Job site updated successfully' })
    @ApiResponse({ status: 404, description: 'Job site not found' })
    async updateJobSite(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateJobSiteDto: UpdateJobSiteDto,
    ) {
        return this.jobSitesService.update(id, updateJobSiteDto, userId);
    }

    @Delete('job-sites/:id')
    @ApiOperation({ summary: 'Delete job site' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job site ID' })
    @ApiResponse({ status: 204, description: 'Job site deleted successfully' })
    @ApiResponse({ status: 404, description: 'Job site not found' })
    async deleteJobSite(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        await this.jobSitesService.remove(id, userId);
    }

    @Post('job-sites/:id/buyers')
    @ApiOperation({ summary: 'Add a buyer to a job site' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job site ID' })
    @ApiBody({ type: AddBuyerToJobSiteRequestDto })
    @ApiResponse({ status: 200, type: JobSiteResponseDto, description: 'Buyer added to job site successfully' })
    @ApiResponse({ status: 404, description: 'Job site not found' })
    async addBuyerToJobSite(
        @Param('id') id: string,
        @Body() addBuyerDto: AddBuyerToJobSiteRequestDto,
        @CurrentUser('userId') userId: string,
    ) {
        return this.jobSitesService.addBuyerToJobSite(id, addBuyerDto, userId);
    }

    @Delete('job-sites/:id/buyers/:buyerId')
    @ApiOperation({ summary: 'Remove buyer from job site' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job site ID' })
    @ApiParam({ name: 'buyerId', type: 'string', description: 'ID of the buyer to remove' })
    @ApiResponse({ status: 204, description: 'Buyer removed from job site successfully' })
    @ApiResponse({ status: 404, description: 'Job site or buyer not found' })
    async removeBuyerFromJobSite(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Param('buyerId') buyerId: string,
    ) {
        await this.jobSitesService.removeBuyerFromJobSite(id, buyerId, userId);
    }

    @Post('job-sites/:id/invitations')
    @ApiOperation({ summary: 'Create job site invitation' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job site ID' })
    @ApiBody({ type: CreateJobSiteInvitationDto })
    @ApiResponse({ status: 201, type: JobSiteInvitationResponseDto, description: 'Invitation created successfully' })
    @ApiResponse({ status: 404, description: 'Job site not found' })
    async createJobSiteInvitation(
        @Param('id') id: string,
        @Body() createInvitationDto: CreateJobSiteInvitationDto,
        @CurrentUser('userId') userId: string,
    ) {
        return this.jobSitesService.createInvitation(id, userId, createInvitationDto.expirationHours);
    }

    @Get('job-sites/:id/invitations')
    @ApiOperation({ summary: 'Get job site invitations' })
    @ApiParam({ name: 'id', type: 'string', description: 'Job site ID' })
    @ApiResponse({ status: 200, type: JobSiteInvitationResponseDto, description: 'List of job site invitations' })
    @ApiResponse({ status: 404, description: 'Job site not found' })
    async getJobSiteInvitations(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        const invitations = await this.jobSitesService.getInvitations(id, userId);
        return { invitations };
    }

    @Post('job-sites/join/:token')
    @ApiOperation({ summary: 'Accept job site invitation' })
    @ApiParam({ name: 'token', type: 'string', description: 'Invitation token' })
    @ApiResponse({ status: 200, type: AcceptJobSiteInvitationResponseDto, description: 'Invitation accepted successfully' })
    @ApiResponse({ status: 404, description: 'Invitation not found or expired' })
    async acceptJobSiteInvitation(
        @Param('token') token: string,
        @CurrentUser('userId') userId: string,
    ) {
        const jobSite = await this.jobSitesService.acceptInvitation(token, userId);
        return {
            message: 'Successfully joined job site',
            jobSiteId: jobSite.id
        };
    }

    @Delete('job-sites/invitations/:id')
    @ApiOperation({ summary: 'Revoke job site invitation' })
    @ApiParam({ name: 'id', type: 'string', description: 'Invitation ID' })
    @ApiResponse({ status: 204, description: 'Invitation revoked successfully' })
    @ApiResponse({ status: 404, description: 'Invitation not found' })
    async revokeJobSiteInvitation(
        @Param('id') id: string,
        @CurrentUser('userId') userId: string,
    ) {
        await this.jobSitesService.revokeInvitation(id, userId);
    }
    //#endregion

    //#region Orders Routes
    @Get('orders')
    @ApiOperation({ summary: 'Get all orders' })
    @ApiResponse({ status: 200, type: [OrderResponseDto], description: 'List of orders' })
    async getOrders(
        @CurrentUser('userId') userId: string,
        @Query() query: OrderQueryDto
    ) {
        return this.buyerService.findOrders(userId, query);
    }

    @Get('orders/quick-lookups')
    @ApiOperation({ summary: 'Get quick lookup data for orders' })
    @ApiResponse({ status: 200, description: 'Quick lookup data for orders' })
    async getQuickLookups(
        @CurrentUser('userId') userId: string
    ) {
        return this.buyerService.getQuickLookups(userId);
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
    @ApiResponse({ status: 200, type: OrderResponseDto, description: 'Order details' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getOrderById(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        return this.buyerService.findOrderById(id, userId);
    }

    @Post('orders')
    @ApiOperation({ summary: 'Create new order' })
    @ApiBody({ type: CreateOrderRequestDto })
    @ApiResponse({ status: 201, type: OrderResponseDto, description: 'Order created successfully' })
    async createOrder(
        @CurrentUser('userId') userId: string,
        @Body() createOrderDto: CreateOrderRequestDto,
    ) {
        return this.buyerService.createOrder(createOrderDto, userId).catch(error => {
            console.log(error);
            throw new InternalServerErrorException(error.message);
        });
    }

    @Put('orders/:id')
    @ApiOperation({ summary: 'Update order' })
    @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiResponse({ status: 200, type: OrderResponseDto, description: 'Order updated successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async updateOrder(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto,
    ) {
        return this.ordersService.update(id, updateOrderDto, userId);
    }

    @Put('orders/:id/status')
    @ApiOperation({ summary: 'Update order status' })
    @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
    @ApiBody({ type: UpdateOrderStatusRequestDto })
    @ApiResponse({ status: 200, type: OrderResponseDto, description: 'Order status updated successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async updateOrderStatus(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusRequestDto,
    ) {
        return this.buyerService.updateOrderStatus(id, updateStatusDto, userId);
    }

    @Delete('orders/:id')
    @ApiOperation({ summary: 'Delete order' })
    @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
    @ApiResponse({ status: 204, description: 'Order deleted successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async deleteOrder(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string
    ) {
        await this.ordersService.remove(id, userId);
    }
    //#endregion

    //#region Quotations Routes
    @Get('quotations')
    @ApiOperation({ summary: 'Get all quotations' })
    @ApiResponse({ status: 200, type: [QuotationResponseDto], description: 'List of quotations' })
    async getQuotations(
        @CurrentUser('userId') userId: string,
        @Query() query: QuotationQueryDto
    ) {
        return this.buyerService.findQuotations(userId, query);
    }

    @Get('quotations/:id')
    @ApiOperation({ summary: 'Get quotation by ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'Quotation ID' })
    @ApiResponse({ status: 200, type: QuotationResponseDto, description: 'Quotation details' })
    @ApiResponse({ status: 404, description: 'Quotation not found' })
    async getQuotationById(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        return this.buyerService.findQuotationById(id, userId);
    }

    @Post('quotations')
    @ApiOperation({ summary: 'Create new quotation' })
    @ApiBody({ type: CreateQuotationRequestDto })
    @ApiResponse({ status: 201, type: QuotationResponseDto, description: 'Quotation created successfully' })
    async createQuotation(
        @CurrentUser('userId') userId: string,
        @Body() createQuotationDto: CreateQuotationRequestDto,
    ) {
        return this.buyerService.createQuotation(createQuotationDto, userId);
    }

    @Put('quotations/:id')
    @ApiOperation({ summary: 'Update quotation' })
    @ApiParam({ name: 'id', type: 'string', description: 'Quotation ID' })
    @ApiBody({ type: UpdateQuotationDto })
    @ApiResponse({ status: 200, type: QuotationResponseDto, description: 'Quotation updated successfully' })
    @ApiResponse({ status: 404, description: 'Quotation not found' })
    async updateQuotation(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateQuotationDto: UpdateQuotationDto,
    ) {
        return this.quotationsService.update(id, updateQuotationDto, userId);
    }

    @Put('quotations/:id/status')
    @ApiOperation({ summary: 'Update quotation status' })
    @ApiParam({ name: 'id', type: 'string', description: 'Quotation ID' })
    @ApiBody({ type: UpdateQuotationStatusRequestDto })
    @ApiResponse({ status: 200, type: QuotationResponseDto, description: 'Quotation status updated successfully' })
    @ApiResponse({ status: 404, description: 'Quotation not found' })
    async updateQuotationStatus(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateQuotationStatusRequestDto,
    ) {
        return this.buyerService.updateQuotationStatus(id, updateStatusDto, userId);
    }

    @Delete('quotations/:id')
    @ApiOperation({ summary: 'Delete quotation' })
    @ApiParam({ name: 'id', type: 'string', description: 'Quotation ID' })
    @ApiResponse({ status: 204, description: 'Quotation deleted successfully' })
    @ApiResponse({ status: 404, description: 'Quotation not found' })
    async deleteQuotation(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<void> {
        await this.quotationsService.remove(id, userId);
    }
    //#endregion

    //#region Notifications Routes
    @Get('notifications')
    @ApiOperation({ summary: 'Get all notifications' })
    @ApiResponse({ status: 200, type: [NotificationResponseDto], description: 'List of notifications' })
    async getAllNotifications(@CurrentUser('userId') userId: string) {
        return this.buyerService.findNotifications(userId);
    }

    @Put('notifications/:id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiParam({ name: 'id', type: 'string', description: 'Notification ID' })
    @ApiResponse({ status: 200, type: NotificationResponseDto, description: 'Notification marked as read' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async markNotificationAsRead(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ) {
        return this.buyerService.markNotificationAsRead(id, userId);
    }

    @Put('notifications/mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({
        status: 200, type: Object, description: 'All notifications marked as read', schema: {
            properties: {
                message: { type: 'string', example: 'All notifications marked as read' }
            }
        }
    })
    async markAllNotificationsAsRead(@CurrentUser('userId') userId: string) {
        await this.notificationsService.markAllAsRead(userId);
        return { message: 'All notifications marked as read' };
    }

    @Delete('notifications/:id')
    @ApiOperation({ summary: 'Delete notification' })
    @ApiParam({ name: 'id', type: 'string', description: 'Notification ID' })
    @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async deleteNotification(
        @CurrentUser('userId') userId: string,
        @Param('id') id: string,
    ): Promise<void> {
        await this.notificationsService.remove(id, userId);
    }

    @Delete('notifications/delete-read')
    @ApiOperation({ summary: 'Delete all read notifications' })
    @ApiResponse({ status: 204, description: 'All read notifications deleted successfully' })
    async deleteAllReadNotifications(@CurrentUser('userId') userId: string): Promise<void> {
        await this.notificationsService.removeAllRead(userId);
    }
    //#endregion

    //#region MapBox Routes
    @Get('addresses/search')
    @ApiOperation({ summary: 'Search addresses using MapBox' })
    @ApiQuery({ name: 'query', required: true, description: 'Search query for addresses' })
    @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results to return' })
    @ApiResponse({
        status: 200,
        description: 'List of address predictions',
        type: [AddressFeatureDto]
    })
    async searchAddresses(
        @Query('query') query: string,
        @Query('limit') limit?: number,
    ): Promise<AddressFeature[]> {
        if (!query) {
            throw new BadRequestException('Search query is required');
        }
        return this.mapboxService.searchAddresses(query, limit);
    }

    @Get('addresses/reverse')
    @ApiOperation({ summary: 'Reverse geocode coordinates to address' })
    @ApiQuery({ name: 'longitude', required: true, type: 'number' })
    @ApiQuery({ name: 'latitude', required: true, type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Address details for the given coordinates',
        type: AddressFeatureDto
    })
    async reverseGeocode(
        @Query('longitude') longitude: number,
        @Query('latitude') latitude: number,
    ): Promise<AddressFeature | null> {
        if (!longitude || !latitude) {
            throw new BadRequestException('Both longitude and latitude are required');
        }
        return this.mapboxService.reverseGeocode(longitude, latitude);
    }

    @Post('addresses/parse')
    @ApiOperation({ summary: 'Parse address feature into structured details' })
    @ApiResponse({
        status: 200,
        description: 'Structured address details',
        type: AddressDetailsDto
    })
    async parseAddressDetails(
        @Body() feature: AddressFeature,
    ): Promise<AddressDetails> {
        if (!feature || !feature.place_name || !feature.center) {
            throw new BadRequestException('Invalid address feature provided');
        }
        return this.mapboxService.parseAddressDetails(feature);
    }
    //#endregion
}