import { SchemasModule } from '@/schemas/schemas.module';
import { LlmModule } from '@/utils/llm/llm.module';
import { MailerModule } from '@/utils/mailer/mailer.module';
import { MinioModule } from '@/utils/minio/minio.module';
import { StripeModule } from '@/utils/stripe/stripe.module';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

@Module({
    imports: [
        LlmModule,
        StripeModule,
        MailerModule,
        MinioModule,
        SchemasModule,
        MulterModule.register({
            storage: memoryStorage(),
        }),
    ],
    controllers: [SupplierController],
    providers: [SupplierService],
    exports: [SupplierService],
})


export class SupplierModule { } 