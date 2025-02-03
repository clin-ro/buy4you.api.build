import { z } from 'zod';

export const QuotationItemSchema = z.object({
    orderItemId: z.string(),
    name: z.string(),
    quantity: z.number().positive(),
    unitOfMeasure: z.string(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    deliveredQuantity: z.number().min(0),
});

export const QuotationItemsSchema = z.object({
    items: z.array(z.object({
        orderItemId: z.string(),
        name: z.string(),
        quantity: z.number().positive(),
        unitOfMeasure: z.string(),
        unitPrice: z.number().positive(),
        totalPrice: z.number().positive(),
        deliveredQuantity: z.number().min(0),
    })),
});

export type QuotationItem = z.infer<typeof QuotationItemSchema>;
export type QuotationItems = z.infer<typeof QuotationItemsSchema>; 