import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponseDto {
    @ApiProperty()
    totalUsers: number;

    @ApiProperty()
    activeUsers: number;

    @ApiProperty()
    newUsersThisMonth: number;

    @ApiProperty()
    usersByRole: {
        [key: string]: number;
    };
}

export class TransactionStatsResponseDto {
    @ApiProperty()
    totalTransactions: number;

    @ApiProperty()
    totalRevenue: number;

    @ApiProperty()
    averageTransactionValue: number;

    @ApiProperty()
    transactionsThisMonth: number;

    @ApiProperty()
    revenueThisMonth: number;
}

export class SystemHealthResponseDto {
    @ApiProperty()
    status: string;

    @ApiProperty()
    uptime: number;

    @ApiProperty()
    memoryUsage: {
        total: number;
        used: number;
        free: number;
    };

    @ApiProperty()
    cpuLoad: number;
}

export class AuditLogResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    action: string;

    @ApiProperty()
    details: string;

    @ApiProperty()
    ipAddress: string;

    @ApiProperty()
    createdAt: Date;
} 