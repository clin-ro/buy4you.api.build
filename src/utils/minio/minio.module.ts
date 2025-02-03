import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';
import { MinioService } from './minio.service';

@Module({
    imports: [
        NestMinioModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                endPoint: configService.get('MINIO_ENDPOINT')!,
                useSSL: configService.get('MINIO_USE_SSL') === 'true',
                accessKey: configService.get('MINIO_ACCESS_KEY')!,
                secretKey: configService.get('MINIO_SECRET_KEY')!,
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MinioService],
    exports: [MinioService],
})
export class MinioModule { } 