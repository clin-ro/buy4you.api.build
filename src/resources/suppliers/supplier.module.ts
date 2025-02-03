import { SchemasModule } from '@/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';

@Module({
    imports: [
        SchemasModule
    ],
    providers: [SupplierService]
})
export class SupplierModule { } 