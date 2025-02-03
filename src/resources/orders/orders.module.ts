import { OrdersService } from '@/resources/orders/orders.service';
import { UtilsModule } from '@/utils/utils.module';
import { Module } from '@nestjs/common';

@Module({
    providers: [OrdersService],
    exports: [OrdersService],
    imports: [UtilsModule],
})
export class OrdersModule { } 