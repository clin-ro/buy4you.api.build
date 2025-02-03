import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class NotificationQueryDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    searchTerm?: string;

    @ApiProperty({ enum: ['info', 'success', 'warning', 'error'], required: false })
    @IsEnum(['info', 'success', 'warning', 'error'])
    @IsOptional()
    type?: 'info' | 'success' | 'warning' | 'error';

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    read?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    orderId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    jobSiteId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    endDate?: string;
} 