import { z } from 'zod';

export const OrderItemSchema = z.object({
    name: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
});

export const OrderItemsSchema = z.object({
    items: z.array(OrderItemSchema),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderItems = z.infer<typeof OrderItemsSchema>; 