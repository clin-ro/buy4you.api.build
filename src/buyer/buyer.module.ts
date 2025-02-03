import { Module } from '@nestjs/common';

import { ResourcesModule } from '@/resources/resources.module';
import { SchemasModule } from '@/schemas/schemas.module';
import { LlmModule } from '@/utils/llm/llm.module';
import { MapboxModule } from '@/utils/mapbox/mapbox.module';
import { NotificationsModule } from '@/utils/notifications/notifications.module';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';

@Module({
    imports: [
        SchemasModule,
        LlmModule,
        MapboxModule,
        ResourcesModule,
        NotificationsModule
    ],
    controllers: [BuyerController],
    providers: [BuyerService],
    exports: [BuyerService],
})
export class BuyerModule { } 