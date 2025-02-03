import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty({ enum: ['buyer', 'supplier'] })
    type: string;
}

export class TokenResponseDto {
    @ApiProperty()
    access_token: string;
}

export class ForgotPasswordDto {
    @ApiProperty()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty()
    token: string;

    @ApiProperty()
    password: string;
} 