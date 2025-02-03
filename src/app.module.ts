import { AdminModule } from '@/admin/admin.module';
import { AuthModule } from '@/auth/auth.module';
import { BuyerModule } from '@/buyer/buyer.module';
import { OrdersModule } from '@/resources/orders/orders.module';
import { QuotationsModule } from '@/resources/quotations/quotations.module';
import { ResourcesModule } from '@/resources/resources.module';
import { SchemasModule } from '@/schemas/schemas.module';
import { SupplierModule } from '@/supplier/supplier.module';
import { UtilsModule } from '@/utils/utils.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    AdminModule,
    BuyerModule,
    SupplierModule,
    ResourcesModule,
    SchemasModule,
    UtilsModule,
    OrdersModule,
    QuotationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
