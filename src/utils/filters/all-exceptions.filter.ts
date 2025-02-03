import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MongooseError } from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';


        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse() as any;
            message = response.message || exception.message;
            error = response.error || 'Http Exception';
        } else if (exception instanceof MongooseError) {
            status = HttpStatus.CONFLICT;
            message = 'Duplicate key error';
            error = 'Conflict';
        }

        response.status(status).json({
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
        });
    }
} 