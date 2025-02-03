import { OrderItemSchema } from '@/resources/orders/zod/order-items.zod';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const QuotationItemSchema = z.object({
    orderItemId: z.string(),
    price: z.number(),
    item: OrderItemSchema,
});

export const QuotationSchema = z.object({
    items: z.array(z.object({
        orderItemId: z.string(),
        price: z.number(),
        item: OrderItemSchema,
    })),
    deliveryTerms: z.string(),
    totalPrice: z.number(),
});

const jsonSchema = zodToJsonSchema(QuotationSchema);


export type QuotationItem = z.infer<typeof QuotationItemSchema>;
export type Quotation = z.infer<typeof QuotationSchema>; 