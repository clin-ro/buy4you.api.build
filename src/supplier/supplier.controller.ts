import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { OrdersService } from '@/resources/orders/orders.service';
import { ProfileResponseDto } from '@/resources/profiles/dto/profile-response.dto';
import { ProfilesService } from '@/resources/profiles/profiles.service';
import { QuotationItemsLLMResponseDto } from '@/resources/quotations/dto/quotation-llm.dto';
import { QuotationResponseDto } from '@/resources/quotations/dto/quotation-response.dto';
import { QuotationsService } from '@/resources/quotations/quotations.service';
import { QuotationItem } from '@/resources/quotations/zod/quotation-items.zod';
import { Quotation, QuotationSchema } from '@/schemas/mongo/quotation.schema';
import { QuotationSchema as QuotationSchemaZod } from '@/resources/quotations/zod/quotation.zod';
import { SubmitQuoteDto, UpdateSupplierProfileDto } from '@/swagger/supplier.dto';
import { LlmService } from '@/utils/llm/llm.service';
import { MinioService } from '@/utils/minio/minio.service';
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response as ExpressResponse } from 'express';
import { Request as ExpressRequest } from 'express';
import { Observable } from 'rxjs';
import { SupplierService } from '../supplier/supplier.service';
import { SupplierOrderResponseDto, SupplierPerformanceResponseDto } from './dto/supplier-response.dto';
interface RequestWithUser extends ExpressRequest {
    user: {
        profileId: string;
    };
}

// @ApiTags('Supplier')
// @ApiBearerAuth()
@Controller('supplier')
// @UseGuards(JwtAuthGuard)
export class SupplierController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly quotationsService: QuotationsService,
        private readonly profilesService: ProfilesService,
        private readonly supplierService: SupplierService,
        private readonly llmService: LlmService,
        private readonly minioService: MinioService,
    ) { }

    //#region Profile
    @Put('profile')
    @ApiOperation({ summary: 'Update supplier profile' })
    @ApiResponse({ status: 200, type: ProfileResponseDto })
    async updateProfile(
        @CurrentUser('profileId') profileId: string,
        @Body() updateProfileDto: UpdateSupplierProfileDto
    ) {
        return this.profilesService.update(profileId, updateProfileDto);
    }
    //#endregion

    //#region Orders
    @Get('orders')
    @ApiOperation({ summary: 'Get all orders' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    @ApiResponse({ status: 200, type: [SupplierOrderResponseDto] })
    async getOrders(
        @CurrentUser('profileId') profileId: string,
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.ordersService.search(profileId, undefined, status, start, end);
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: SupplierOrderResponseDto })
    async getOrderById(
        @CurrentUser('profileId') profileId: string,
        @Param('id') id: string
    ) {
        return this.ordersService.findById(id, profileId);
    }

    @Get('performance')
    @ApiOperation({ summary: 'Get supplier performance metrics' })
    @ApiResponse({ status: 200, type: SupplierPerformanceResponseDto })
    async getPerformanceMetrics(@CurrentUser('profileId') profileId: string) {
        return this.supplierService.getPerformanceMetrics();
    }
    //#endregion

    //#region Quotations
    @Get('quotations')
    @ApiOperation({ summary: 'Get all quotations' })
    @ApiQuery({ name: 'status', required: false })
    @ApiResponse({ status: 200, type: [QuotationResponseDto] })
    async getQuotations(
        @CurrentUser('profileId') profileId: string,
        @Query('status') status?: string
    ) {
        return this.quotationsService.findAll(profileId);
    }

    @Get('quotations/:id')
    @ApiOperation({ summary: 'Get quotation by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, type: QuotationResponseDto })
    async getQuotationById(
        @CurrentUser('profileId') profileId: string,
        @Param('id') id: string
    ) {
        return this.quotationsService.findById(id, profileId);
    }

    @Post('quotations/:quotationId/submit')
    @ApiOperation({ summary: 'Submit quotation' })
    @ApiResponse({ status: 201, type: QuotationResponseDto })
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'application/pdf') {
                return cb(new Error('Only PDF files are allowed'), false);
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
                },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            quantity: { type: 'number' },
                            unit: { type: 'string' },
                            description: { type: 'string' },
                            unitPrice: { type: 'number' },
                            totalPrice: { type: 'number' }
                        }
                    }
                },
                deliveryDate: { type: 'string', format: 'date-time' },
                notes: { type: 'string' }
            }
        }
    })
    async submitQuote(
        @Request() req: RequestWithUser,
        @Param('quotationId') quotationId: string,
        @Body() submitQuoteDto: SubmitQuoteDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('PDF quotation file is required');
        }

        try {
            // Upload file to Minio
            const fileKey = `quotations/${quotationId}/${Date.now()}-${file.originalname}`;
            const fileUrl = await this.minioService.uploadFile(
                fileKey,
                file.buffer,
                file.mimetype,
                { quotationId, supplierId: req.user.profileId }
            );

            // Add file information to the DTO
            submitQuoteDto.file = {
                fileName: file.originalname,
                contentType: file.mimetype,
                size: file.size
            };

            // Submit the quote with the file URL
            return this.supplierService.submitQuote(req.user.profileId, quotationId, submitQuoteDto, fileUrl);
        } catch (error) {
            throw new BadRequestException('Failed to upload quotation file');
        }
    }

    @Delete('quotations/:id')
    @ApiOperation({ summary: 'Delete quotation' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 204 })
    async deleteQuotation(
        @CurrentUser('profileId') profileId: string,
        @Param('id') id: string
    ) {
        await this.quotationsService.remove(id, profileId);
    }
    //#endregion

    //#region LLM Routes
    @Post('llm/stream')
    @ApiOperation({ summary: 'Stream quotation extraction from PDF' })
    @ApiResponse({ status: 200, description: 'Quotation extracted successfully' })
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'application/pdf') {
                return cb(new Error('Only PDF files are allowed'), false);
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
                    description: 'PDF file to extract quotation from'
                }
            }
        }
    })
    async streamQuotation(
        @Res() res: ExpressResponse<any>,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<void> {
        if (!file) throw new BadRequestException('PDF file is required');
        await this.llmService.streamFromPdf<Quotation>(
            file.buffer,
            QuotationSchemaZod,
            (partial) => {
                res.write(JSON.stringify(partial));
            } // Empty callback since we just want the final result
        );
        res.end();
    }
    // async streamQuotation(
    //     @UploadedFile() file: Express.Multer.File,
    // ): Promise<Observable<MessageEvent>> {
    //     if (!file) {
    //         throw new BadRequestException('PDF file is required');
    //     }

    //     return new Observable<MessageEvent>((subscriber) => {
    //         this.llmService
    //             .streamFromPdf(
    //                 file.buffer,
    //                 QuotationSchema,
    //                 (partial: Partial<Quotation>) => {
    //                     const messageEvent = new MessageEvent('message', {
    //                         data: JSON.stringify(partial),
    //                     });
    //                     subscriber.next(messageEvent);
    //                 },
    //             )
    //             .then((finalQuotation) => {
    //                 const messageEvent = new MessageEvent('message', {
    //                     data: JSON.stringify({ type: 'final', data: finalQuotation }),
    //                 });
    //                 subscriber.next(messageEvent);
    //                 subscriber.complete();
    //             })
    //             .catch((error) => {
    //                 subscriber.error(error);
    //             });
    //     });
    // }

    @Post('llm/items')
    @ApiOperation({ summary: 'Generate quotation items from natural language or PDF' })
    @ApiResponse({ status: 200, description: 'Quotation items generated successfully', type: QuotationItemsLLMResponseDto })
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'application/pdf') {
                return cb(new Error('Only PDF files are allowed'), false);
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
                    description: 'PDF file to extract items from'
                },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            quantity: { type: 'number' },
                            unit: { type: 'string' },
                            description: { type: 'string' },
                            unitPrice: { type: 'number' },
                            totalPrice: { type: 'number' }
                        }
                    }
                },
                prompt: {
                    type: 'string',
                    description: 'Natural language description of changes to make'
                }
            }
        }
    })
    async generateQuotation(
        @Res() res: ExpressResponse<any>,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<void> {
        if (!file) throw new BadRequestException('PDF file is required');
        await this.llmService.streamFromPdf<Quotation>(
            file.buffer,
            QuotationSchemaZod,
            (partial) => {
                res.write(JSON.stringify(partial));
            } // Empty callback since we just want the final result
        );
        res.end();
    }
    //#endregion
} 