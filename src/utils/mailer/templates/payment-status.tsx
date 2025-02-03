import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface PaymentStatusEmailProps {
    recipientName: string;
    orderId: string;
    status: 'required' | 'successful' | 'failed';
    amount: number;
    currency: string;
    paymentUrl?: string;
    receiptUrl?: string;
    errorMessage?: string;
    dashboardUrl: string;
}

export const PaymentStatusEmail = ({
    recipientName,
    orderId,
    status,
    amount,
    currency,
    paymentUrl,
    receiptUrl,
    errorMessage,
    dashboardUrl,
}: PaymentStatusEmailProps) => {
    const statusConfig = {
        required: {
            color: '#F59E0B',
            title: 'Payment Required',
            message: 'Payment is required to process your order.',
        },
        successful: {
            color: '#34D399',
            title: 'Payment Successful',
            message: 'Your payment has been successfully processed.',
        },
        failed: {
            color: '#EF4444',
            title: 'Payment Failed',
            message: 'There was an issue processing your payment.',
        },
    }[status];

    return (
        <Html>
            <Head />
            <Preview>{statusConfig.title} - Order #{orderId}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Img
                        src={`${process.env.APP_URL}/images/logo.png`}
                        width="170"
                        height="50"
                        alt="Buy4You"
                        style={logo}
                    />
                    <Heading style={{ ...heading, color: statusConfig.color }}>
                        {statusConfig.title}
                    </Heading>
                    <Section style={section}>
                        <Text style={text}>
                            Dear {recipientName},
                        </Text>
                        <Text style={text}>
                            {statusConfig.message}
                        </Text>
                        <Text style={text}>
                            Order Details:
                            <br />
                            Order ID: #{orderId}
                            <br />
                            Amount: {currency}{amount.toFixed(2)}
                        </Text>
                        {status === 'failed' && errorMessage && (
                            <Text style={errorText}>
                                Error: {errorMessage}
                            </Text>
                        )}
                        {status === 'required' && paymentUrl && (
                            <Link href={paymentUrl} style={button}>
                                Make Payment
                            </Link>
                        )}
                        {status === 'successful' && receiptUrl && (
                            <Link href={receiptUrl} style={button}>
                                View Receipt
                            </Link>
                        )}
                        <Link href={dashboardUrl} style={button}>
                            View Order Details
                        </Link>
                    </Section>
                    <Text style={footer}>
                        This is an automated message, please do not reply to this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const logo = {
    margin: '0 auto',
    marginBottom: '32px',
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    padding: '17px 0 0',
    textAlign: 'center' as const,
};

const section = {
    padding: '0 48px',
    marginBottom: '32px',
};

const text = {
    margin: '0 0 20px',
    fontSize: '16px',
    lineHeight: '24px',
    color: '#484848',
};

const errorText = {
    margin: '0 0 20px',
    fontSize: '16px',
    lineHeight: '24px',
    color: '#EF4444',
    fontWeight: 'bold',
};

const button = {
    backgroundColor: '#5469d4',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
};

const footer = {
    fontSize: '12px',
    color: '#898989',
    textAlign: 'center' as const,
    padding: '0 48px',
};

export default PaymentStatusEmail; 