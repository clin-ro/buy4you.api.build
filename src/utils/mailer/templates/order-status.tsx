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

interface OrderStatusEmailProps {
    recipientName: string;
    orderId: string;
    status: string;
    items: Array<{
        name: string;
        quantity: number;
        unit: string;
        deliveredQuantity: number;
    }>;
    jobSiteName: string;
    deliveryAddress: string;
    deliveryDate?: string;
    trackingNumber?: string;
    notes?: string;
    dashboardUrl: string;
}

export const OrderStatusEmail = ({
    recipientName,
    orderId,
    status,
    items,
    jobSiteName,
    deliveryAddress,
    deliveryDate,
    trackingNumber,
    notes,
    dashboardUrl,
}: OrderStatusEmailProps) => {
    const statusColor = {
        pending: '#F59E0B',
        shipping: '#3B82F6',
        shipped: '#34D399',
        delivered: '#10B981',
        completed: '#059669',
        cancelled: '#EF4444',
    }[status.toLowerCase()];

    const statusText = {
        pending: 'Order Pending',
        shipping: 'Order Shipping',
        shipped: 'Order Shipped',
        delivered: 'Order Delivered',
        completed: 'Order Completed',
        cancelled: 'Order Cancelled',
    }[status.toLowerCase()] || 'Order Status Update';

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
                            Your order #{orderId} has been updated to {status.toLowerCase()}.
                        </Text>
                        <Text style={text}>Order Details:</Text>
                        {items.map((item, index) => (
                            <Text key={index} style={itemText}>
                                {item.name} - {item.deliveredQuantity}/{item.quantity} {item.unit} delivered
                            </Text>
                        ))}
                        <Text style={text}>
                            Job Site: {jobSiteName}
                            <br />
                            Delivery Address: {deliveryAddress}
                            {deliveryDate && (
                                <>
                                    <br />
                                    Expected Delivery: {deliveryDate}
                                </>
                            )}
                            {trackingNumber && (
                                <>
                                    <br />
                                    Tracking Number: {trackingNumber}
                                </>
                            )}
                        </Text>
                        {notes && (
                            <Text style={text}>
                                Notes: {notes}
                            </Text>
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

const itemText = {
    margin: '0 0 10px',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#484848',
    paddingLeft: '20px',
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

export default OrderStatusEmail; 