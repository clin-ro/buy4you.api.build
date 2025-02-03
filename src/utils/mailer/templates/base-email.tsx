import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import { Tailwind } from "@react-email/tailwind";
import * as React from 'react';

const baseUrl = process.env.BASE_URL || '';

interface BaseEmailProps {
    previewText: string;
    children: React.ReactNode;
}

export const BaseEmail = ({ previewText, children }: BaseEmailProps) => (
    <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Tailwind>
            <Body className="bg-white font-sans">
                <Container className="mx-auto py-5 w-[580px]">
                    <Section>
                        <Img
                            src={`${baseUrl}/logo.png`}
                            width="120"
                            height="50"
                            alt="Buy4You Logo"
                            className="mx-auto mb-6"
                        />
                    </Section>

                    {children}

                    <Section className="mt-8 text-center">
                        <Text className="text-sm text-gray-500 my-1">
                            © {new Date().getFullYear()} Buy4You. All rights reserved.
                        </Text>
                        <Text className="text-sm text-gray-500 my-2">
                            <Link href="#" className="text-blue-600 no-underline">Terms of Service</Link>
                            {' • '}
                            <Link href="#" className="text-blue-600 no-underline">Privacy Policy</Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default BaseEmail; 