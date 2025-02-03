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

interface SubscriptionStatusEmailProps {
    recipientName: string;
    planName: string;
    status: 'active' | 'expired' | 'warning' | 'renewed';
    ordersUsed: number;
    ordersIncluded: number;
    expiryDate: string;
    renewalUrl?: string;
    dashboardUrl: string;
}

export const SubscriptionStatusEmail = ({
    recipientName,
    planName,
    status,
    ordersUsed,
    ordersIncluded,
    expiryDate,
    renewalUrl,
    dashboardUrl,
}: SubscriptionStatusEmailProps) => {
    const statusConfig = {
        active: {
            color: '#34D399',
            title: 'Subscription Active',
            message: 'Your subscription is active and in good standing.',
        },
        expired: {
            color: '#EF4444',
            title: 'Subscription Expired',
            message: 'Your subscription has expired. Please renew to continue using our services.',
        },
        warning: {
            color: '#F59E0B',
            title: 'Subscription Warning',
            message: 'You are approaching your order limit.',
        },
        renewed: {
            color: '#10B981',
            title: 'Subscription Renewed',
            message: 'Your subscription has been successfully renewed.',
        },
    }[status];

    return (
        <Html>
            <Head />
            <Preview>{statusConfig.title} - Buy4You</Preview>
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
                            Subscription Details:
                            <br />
                            Plan: {planName}
                            <br />
                            Orders Used: {ordersUsed}/{ordersIncluded}
                            <br />
                            Expiry Date: {expiryDate}
                        </Text>
                        {status === 'warning' && (
                            <Text style={warningText}>
                                You have used {ordersUsed} out of {ordersIncluded} included orders.
                                Consider upgrading your plan to ensure uninterrupted service.
                            </Text>
                        )}
                        {(status === 'expired' || status === 'warning') && renewalUrl && (
                            <Link href={renewalUrl} style={button}>
                                {status === 'expired' ? 'Renew Subscription' : 'Upgrade Plan'}
                            </Link>
                        )}
                        <Link href={dashboardUrl} style={button}>
                            View Subscription Details
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

const warningText = {
    margin: '0 0 20px',
    fontSize: '16px',
    lineHeight: '24px',
    color: '#F59E0B',
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

export default SubscriptionStatusEmail; 