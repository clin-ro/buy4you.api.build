import { BaseEntity } from '@/schemas/mongo/common.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class SupplierCategory extends BaseEntity {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: String })
    icon?: string;

    @Prop({ type: Number, default: 0 })
    sortOrder: number;
}

export const SupplierCategorySchema = SchemaFactory.createForClass(SupplierCategory); 