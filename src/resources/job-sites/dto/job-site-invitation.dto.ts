import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateJobSiteInvitationDto {
    @ApiProperty({
        description: 'Number of hours until the invitation expires',
        example: 72,
        default: 72,
        required: false
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    expirationHours?: number;
}

export class JobSiteInvitationResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the invitation',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the job site this invitation is for',
        example: '507f1f77bcf86cd799439011'
    })
    jobSiteId: string;

    @ApiProperty({
        description: 'Invitation token',
        example: 'abc123def456'
    })
    token: string;

    @ApiProperty({
        description: 'Expiration timestamp',
        example: '2024-01-04T00:00:00.000Z'
    })
    expiresAt: Date;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;
}

export class JobSiteInvitationListResponseDto {
    @ApiProperty({
        description: 'List of job site invitations',
        type: [JobSiteInvitationResponseDto]
    })
    invitations: JobSiteInvitationResponseDto[];
}

export class AcceptJobSiteInvitationResponseDto {
    @ApiProperty({
        description: 'Message confirming the invitation was accepted',
        example: 'Successfully joined job site'
    })
    message: string;

    @ApiProperty({
        description: 'ID of the job site that was joined',
        example: '507f1f77bcf86cd799439011'
    })
    jobSiteId: string;
} 