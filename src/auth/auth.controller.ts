import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from '@/swagger/auth.dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseDto, RegisterResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, type: LoginResponseDto })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('register')
    @ApiOperation({ summary: 'Register new user' })
    @ApiResponse({ status: 201, type: RegisterResponseDto })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiResponse({ status: 200, description: 'Password reset email sent' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        await this.authService.forgotPassword(forgotPasswordDto.email);
        return { message: 'Password reset email sent' };
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
        return { message: 'Password reset successful' };
    }

    @Get('check')
    @ApiOperation({ summary: 'Check if user is authenticated' })
    @ApiResponse({ status: 200, description: 'User is authenticated' })
    async check() {
        return { message: 'User is authenticated' };
    }
} 
