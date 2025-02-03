import { Section, Text } from '@react-email/components';
import BaseEmail from './base-email';

interface QuotationItem {
    name: string;
    quantity: number;
    specifications?: string;
}

interface QuotationRequestEmailProps {
    supplierName: string;
    buyerName: string;
    quotationId: string;
    items: QuotationItem[];
    additionalNotes?: string;
}

export const QuotationRequestEmail = ({
    supplierName,
    buyerName,
    quotationId,
    items,
    additionalNotes,
}: QuotationRequestEmailProps) => (
    <BaseEmail previewText={`New Quotation Request #${quotationId}`}>
        <Section className="py-5">
            <Text className="text-2xl font-semibold leading-tight mb-4">New Quotation Request</Text>
            <Text className="text-base text-gray-700 leading-relaxed my-4">Hi {supplierName},</Text>
            <Text className="text-base text-gray-700 leading-relaxed my-4">
                You have received a new quotation request from {buyerName}.
            </Text>

            <Text className="text-xl font-semibold mt-6 mb-3">Request Details</Text>
            <Text className="text-sm text-gray-500 mb-4">Request #{quotationId}</Text>

            {items.map((item, index) => (
                <Section key={index} className="py-3 border-b border-gray-200">
                    <Text className="text-base font-medium m-0">{item.name}</Text>
                    <Text className="text-sm text-gray-500 my-1">
                        Quantity: {item.quantity}
                    </Text>
                    {item.specifications && (
                        <Text className="text-sm text-gray-500 my-1 italic">
                            Specifications: {item.specifications}
                        </Text>
                    )}
                </Section>
            ))}

            {additionalNotes && (
                <Section className="mt-8 bg-gray-50 p-4 rounded">
                    <Text className="text-xl font-semibold mb-3">Additional Notes</Text>
                    <Text className="text-base text-gray-700 leading-relaxed">
                        {additionalNotes}
                    </Text>
                </Section>
            )}

            <Text className="text-base text-gray-700 leading-relaxed mt-6">
                Please review the request and provide your quotation through the Buy4You platform.
            </Text>

            <Text className="text-base text-gray-700 leading-relaxed mt-4">
                Best regards,<br />
                Buy4You Team
            </Text>
        </Section>
    </BaseEmail>
);

export default QuotationRequestEmail; 