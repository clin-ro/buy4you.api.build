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

interface ProfileStatusEmailProps {
    recipientName: string;
    status: 'approved' | 'rejected';
    reason?: string;
    profileType: 'company' | 'individual';
    dashboardUrl: string;
}

export const ProfileStatusEmail = ({
    recipientName,
    status,
    reason,
    profileType,
    dashboardUrl,
}: ProfileStatusEmailProps) => {
    const statusConfig = {
        approved: {
            color: '#34D399',
            title: 'Profile Approved',
            message: 'Your profile has been approved. You can now start using Buy4You services.',
        },
        rejected: {
            color: '#EF4444',
            title: 'Profile Needs Updates',
            message: 'Your profile requires some updates before it can be approved.',
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
                        {status === 'approved' && (
                            <>
                                <Text style={text}>
                                    As an approved {profileType}, you can now:
                                </Text>
                                <ul style={list}>
                                    <li style={listItem}>Create and manage job sites</li>
                                    <li style={listItem}>Place orders with our trusted suppliers</li>
                                    <li style={listItem}>Track deliveries and manage quotations</li>
                                    <li style={listItem}>Access all Buy4You services</li>
                                </ul>
                            </>
                        )}
                        {status === 'rejected' && reason && (
                            <Text style={errorText}>
                                Reason for rejection:
                                <br />
                                {reason}
                            </Text>
                        )}
                        <Link href={dashboardUrl} style={button}>
                            {status === 'approved' ? 'Go to Dashboard' : 'Update Profile'}
                        </Link>
                    </Section>
                    <Text style={footer}>
                        If you have any questions, please contact our support team.
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

const list = {
    margin: '0 0 24px',
    padding: '0 0 0 24px',
    color: '#484848',
};

const listItem = {
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '8px',
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

export default ProfileStatusEmail; 