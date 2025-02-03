import { ProfilesModule } from '@/resources/profiles/profiles.module';
import { QuotationsService } from '@/resources/quotations/quotations.service';
import { UtilsModule } from '@/utils/utils.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [ProfilesModule, UtilsModule],
    providers: [QuotationsService],
    exports: [QuotationsService],
})
export class QuotationsModule { } 