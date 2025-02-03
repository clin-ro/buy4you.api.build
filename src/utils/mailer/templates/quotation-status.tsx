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

interface QuotationStatusEmailProps {
    recipientName: string;
    quotationId: string;
    orderId: string;
    status: string;
    reason?: string;
    items: Array<{
        name: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
    }>;
    totalAmount: number;
    currency: string;
    dashboardUrl: string;
}

export const QuotationStatusEmail = ({
    recipientName,
    quotationId,
    orderId,
    status,
    reason,
    items,
    totalAmount,
    currency,
    dashboardUrl,
}: QuotationStatusEmailProps) => {
    const statusColor = {
        accepted: '#34D399',
        rejected: '#EF4444',
        pending: '#F59E0B',
    }[status.toLowerCase()];

    const statusText = {
        accepted: 'Quotation Accepted',
        rejected: 'Quotation Rejected',
        pending: 'Quotation Status Update',
    }[status.toLowerCase()] || 'Quotation Status Update';

    return (
        <Html>
            <Head />
            <Preview>{statusText} - Order #{orderId}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Img
                        src={`${process.env.APP_URL}/images/logo.png`}
                        width="170"
                        height="50"
                        alt="Buy4You"
                        style={logo}
                    />
                    <Heading style={{ ...heading, color: statusColor }}>
                        {statusText}
                    </Heading>
                    <Section style={section}>
                        <Text style={text}>
                            Dear {recipientName},
                        </Text>
                        <Text style={text}>
                            The quotation #{quotationId} for order #{orderId} has been {status.toLowerCase()}.
                            {reason && (
                                <>
                                    <br />
                                    <br />
                                    Reason: {reason}
                                </>
                            )}
                        </Text>
                        <Text style={text}>Order Details:</Text>
                        {items.map((item, index) => (
                            <Text key={index} style={itemText}>
                                {item.name} - {item.quantity} {item.unit} x {currency}{item.unitPrice} = {currency}{item.totalPrice}
                            </Text>
                        ))}
                        <Text style={totalText}>
                            Total Amount: {currency}{totalAmount}
                        </Text>
                        <Link href={dashboardUrl} style={button}>
                            View in Dashboard
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

const itemText = {
    margin: '0 0 10px',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#484848',
    paddingLeft: '20px',
};

const totalText = {
    margin: '20px 0',
    fontSize: '18px',
    lineHeight: '24px',
    color: '#484848',
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

export default QuotationStatusEmail; 