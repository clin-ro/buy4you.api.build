import { QuotationItem } from '@/resources/quotations/zod/quotation-items.zod';
import { ApiProperty } from '@nestjs/swagger';

export class QuotationItemsLLMRequestDto {
    @ApiProperty({
        description: 'Current list of quotation items',
        type: [Object],
        example: [{
            orderItemId: '123',
            name: 'Steel Pipes',
            quantity: 100,
            unitOfMeasure: 'meters',
            unitPrice: 50,
            totalPrice: 5000,
            deliveredQuantity: 0
        }]
    })
    items: QuotationItem[];

    @ApiProperty({
        description: 'Natural language prompt describing changes to make to the quotation items',
        example: 'Add 200 meters of copper pipes at $75 per meter'
    })
    prompt: string;
}

export class QuotationItemsLLMResponseDto {
    @ApiProperty({
        description: 'Updated list of quotation items',
        type: [Object],
        example: [{
            orderItemId: '123',
            name: 'Steel Pipes',
            quantity: 100,
            unitOfMeasure: 'meters',
            unitPrice: 50,
            totalPrice: 5000,
            deliveredQuantity: 0
        }, {
            orderItemId: '124',
            name: 'Copper Pipes',
            quantity: 200,
            unitOfMeasure: 'meters',
            unitPrice: 75,
            totalPrice: 15000,
            deliveredQuantity: 0
        }]
    })
    items: QuotationItem[];
} 