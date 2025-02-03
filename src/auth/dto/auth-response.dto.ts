import { User } from '@/schemas/mongo/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({ type: () => User })
    user: User;

    @ApiProperty()
    token: string;
}

export class RegisterResponseDto {
    @ApiProperty({ type: () => User })
    user: User;

    @ApiProperty()
    token: string;
}

export class ForgotPasswordResponseDto {
    @ApiProperty()
    message: string;
}

export class ResetPasswordResponseDto {
    @ApiProperty()
    message: string;
} 