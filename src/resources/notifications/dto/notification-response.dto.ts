import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    profileId: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    message: string;

    @ApiProperty({ enum: ['info', 'success', 'warning', 'error'] })
    type: 'info' | 'success' | 'warning' | 'error';

    @ApiProperty()
    read: boolean;

    @ApiProperty({ required: false })
    orderId?: string;

    @ApiProperty({ required: false })
    jobSiteId?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
} 