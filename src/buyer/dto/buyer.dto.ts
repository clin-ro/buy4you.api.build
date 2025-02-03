import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddBuyerToJobSiteDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string;
} 