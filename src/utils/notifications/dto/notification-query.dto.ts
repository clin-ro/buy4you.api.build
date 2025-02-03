import { NotificationType } from '@/schemas/mongo/notification.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class NotificationQueryDto {
    @ApiProperty({ required: false, enum: NotificationType })
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    read?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    orderId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    jobSiteId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    searchTerm?: string;
} 