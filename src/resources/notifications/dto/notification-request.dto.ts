import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({ enum: ['info', 'success', 'warning', 'error'] })
    @IsEnum(['info', 'success', 'warning', 'error'])
    type: 'info' | 'success' | 'warning' | 'error';

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    orderId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    jobSiteId?: string;
}

export class UpdateNotificationDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    message?: string;

    @ApiProperty({ enum: ['info', 'success', 'warning', 'error'], required: false })
    @IsEnum(['info', 'success', 'warning', 'error'])
    @IsOptional()
    type?: 'info' | 'success' | 'warning' | 'error';

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    orderId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    jobSiteId?: string;
} 