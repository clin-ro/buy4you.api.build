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

interface WelcomeEmailProps {
    recipientName: string;
    verificationLink: string;
    dashboardUrl: string;
}

export const WelcomeEmail = ({
    recipientName,
    verificationLink,
    dashboardUrl,
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Buy4You - Please Verify Your Email</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Img
                        src={`${process.env.APP_URL}/images/logo.png`}
                        width="170"
                        height="50"
                        alt="Buy4You"
                        style={logo}
                    />
                    <Heading style={heading}>
                        Welcome to Buy4You!
                    </Heading>
                    <Section style={section}>
                        <Text style={text}>
                            Dear {recipientName},
                        </Text>
                        <Text style={text}>
                            Thank you for joining Buy4You! We're excited to have you on board.
                            To get started, please verify your email address by clicking the button below:
                        </Text>
                        <Link href={verificationLink} style={button}>
                            Verify Email Address
                        </Link>
                        <Text style={text}>
                            Once verified, you can:
                        </Text>
                        <ul style={list}>
                            <li style={listItem}>Complete your profile</li>
                            <li style={listItem}>Create and manage job sites</li>
                            <li style={listItem}>Place orders with our trusted suppliers</li>
                            <li style={listItem}>Track deliveries and manage quotations</li>
                        </ul>
                        <Link href={dashboardUrl} style={button}>
                            Go to Dashboard
                        </Link>
                        <Text style={text}>
                            If you have any questions or need assistance, our support team is here to help.
                        </Text>
                    </Section>
                    <Text style={footer}>
                        If you did not create this account, please ignore this email.
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
    color: '#484848',
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

export default WelcomeEmail; 