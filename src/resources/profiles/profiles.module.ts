import { ProfilesService } from '@/resources/profiles/profiles.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [ProfilesService],
    exports: [ProfilesService],
})
export class ProfilesModule { } 