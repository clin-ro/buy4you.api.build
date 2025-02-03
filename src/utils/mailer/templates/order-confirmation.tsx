import { Hr, Section, Text } from '@react-email/components';
import BaseEmail from './base-email';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderConfirmationEmailProps {
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    shippingAddress: string;
}

export const OrderConfirmationEmail = ({
    orderNumber,
    customerName,
    items,
    total,
    shippingAddress,
}: OrderConfirmationEmailProps) => (
    <BaseEmail previewText={`Order Confirmation #${orderNumber}`}>
        <Section className="py-5">
            <Text className="text-2xl font-semibold leading-tight mb-4">Order Confirmation</Text>
            <Text className="text-base text-gray-700 leading-relaxed my-4">Hi {customerName},</Text>
            <Text className="text-base text-gray-700 leading-relaxed my-4">
                Thank you for your order! We've received your order and it's being processed.
            </Text>

            <Text className="text-xl font-semibold mt-6 mb-3">Order Details</Text>
            <Text className="text-sm text-gray-500 mb-2">Order #{orderNumber}</Text>

            {items.map((item, index) => (
                <Section key={index} className="py-3 border-b border-gray-200">
                    <Text className="text-base font-medium m-0">{item.name}</Text>
                    <Text className="text-sm text-gray-500 my-1">
                        Quantity: {item.quantity} x ${item.price.toFixed(2)}
                    </Text>
                    <Text className="text-sm font-medium text-right m-0">
                        ${(item.quantity * item.price).toFixed(2)}
                    </Text>
                </Section>
            ))}

            <Hr className="my-5 border-t border-gray-200" />

            <Section className="flex justify-between py-3">
                <Text className="text-base font-semibold m-0">Total</Text>
                <Text className="text-base font-semibold m-0">${total.toFixed(2)}</Text>
            </Section>

            <Section className="mt-8 bg-gray-50 p-4 rounded">
                <Text className="text-xl font-semibold mb-3">Shipping Address</Text>
                <Text className="text-base text-gray-700 leading-relaxed">
                    {shippingAddress}
                </Text>
            </Section>

            <Text className="text-base text-gray-700 leading-relaxed mt-6">
                We'll send you another email when your order ships.
            </Text>

            <Text className="text-base text-gray-700 leading-relaxed mt-4">
                Best regards,<br />
                Buy4You Team
            </Text>
        </Section>
    </BaseEmail>
);

export default OrderConfirmationEmail; 