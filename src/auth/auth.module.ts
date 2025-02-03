import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { ApiKeyStrategy } from '@/auth/strategies/api-key.strategy';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { ResourcesModule } from '@/resources/resources.module';
import { SchemasModule } from '@/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyGuard } from './guards/api-key.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '365d' },
            }),
        }),
        SchemasModule,
        ResourcesModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        ApiKeyStrategy,
        RolesGuard,
        ApiKeyGuard,
    ],
    exports: [AuthService, RolesGuard, ApiKeyGuard],
})
export class AuthModule { } 