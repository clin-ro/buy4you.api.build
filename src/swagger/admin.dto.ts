import { ApiProperty } from '@nestjs/swagger';

export class DashboardQueryDto {
    @ApiProperty({ required: false })
    startDate?: string;

    @ApiProperty({ required: false })
    endDate?: string;
}

export class DashboardStatsDto {
    @ApiProperty()
    orders: {
        total: number;
        pending: number;
        completed: number;
        cancelled: number;
    };

    @ApiProperty()
    quotations: {
        total: number;
        pending: number;
        accepted: number;
        rejected: number;
    };

    @ApiProperty()
    users: {
        total: number;
        buyers: number;
        suppliers: number;
        new: number;
    };

    @ApiProperty()
    revenue: {
        total: number;
        thisMonth: number;
        lastMonth: number;
        growth: number;
    };
}

export class UserQueryDto {
    @ApiProperty({ required: false })
    type?: string;

    @ApiProperty({ required: false })
    isVerified?: boolean;

    @ApiProperty({ required: false })
    isBlocked?: boolean;
}

export class UserResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    roles: string[];

    @ApiProperty()
    isVerified: boolean;

    @ApiProperty()
    isBlocked: boolean;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    canManageOwnOrders: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class VerifyUserDto {
    @ApiProperty()
    isVerified: boolean;
}

export class BlockUserDto {
    @ApiProperty()
    isBlocked: boolean;
} 