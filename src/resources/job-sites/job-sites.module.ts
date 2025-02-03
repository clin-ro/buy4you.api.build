import { JobSiteInvitation, JobSiteInvitationSchema } from '@/schemas/mongo/job-site-invitation.schema';
import { JobSite, JobSiteSchema } from '@/schemas/mongo/job-site.schema';
import { Order, OrderSchema } from '@/schemas/mongo/order.schema';
import { Profile, ProfileSchema } from '@/schemas/mongo/profile.schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSitesService } from './job-sites.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: JobSite.name, schema: JobSiteSchema },
            { name: JobSiteInvitation.name, schema: JobSiteInvitationSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Profile.name, schema: ProfileSchema }
        ]),
        ConfigModule
    ],
    providers: [JobSitesService],
    exports: [JobSitesService]
})
export class JobSitesModule { } 