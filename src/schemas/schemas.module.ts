import { JobSite, JobSiteSchema } from '@/schemas/mongo/job-site.schema';
import { Notification, NotificationSchema } from '@/schemas/mongo/notification.schema';
import { Order, OrderSchema } from '@/schemas/mongo/order.schema';
import { Profile, ProfileSchema } from '@/schemas/mongo/profile.schema';
import { Quotation, QuotationSchema } from '@/schemas/mongo/quotation.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from '@/schemas/mongo/subscription-plan.schema';
import { SupplierCategory, SupplierCategorySchema } from '@/schemas/mongo/supplier-category.schema';
import { SupplierCompany, SupplierCompanySchema } from '@/schemas/mongo/supplier-company.schema';
import { Supplier, SupplierSchema } from '@/schemas/mongo/supplier.schema';
import { User, UserSchema } from '@/schemas/mongo/user.schema';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Profile.name, schema: ProfileSchema },
            { name: Quotation.name, schema: QuotationSchema },
            { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
            { name: JobSite.name, schema: JobSiteSchema },
            { name: Supplier.name, schema: SupplierSchema },
            { name: SupplierCategory.name, schema: SupplierCategorySchema },
            { name: SupplierCompany.name, schema: SupplierCompanySchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    exports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Profile.name, schema: ProfileSchema },
            { name: Quotation.name, schema: QuotationSchema },
            { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
            { name: JobSite.name, schema: JobSiteSchema },
            { name: Supplier.name, schema: SupplierSchema },
            { name: SupplierCategory.name, schema: SupplierCategorySchema },
            { name: SupplierCompany.name, schema: SupplierCompanySchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
})
export class SchemasModule { } 