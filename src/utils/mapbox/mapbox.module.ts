import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MapboxService } from './mapbox.service';

@Module({
    imports: [ConfigModule],
    providers: [MapboxService],
    exports: [MapboxService],
})
export class MapboxModule { } 