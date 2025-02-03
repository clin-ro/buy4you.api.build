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

interface JobSiteInvitationEmailProps {
    inviterName: string;
    jobSiteName: string;
    invitationLink: string;
    qrCodeUrl: string;
    expiryDate: string;
}

export const JobSiteInvitationEmail = ({
    inviterName,
    jobSiteName,
    invitationLink,
    qrCodeUrl,
    expiryDate,
}: JobSiteInvitationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>You've been invited to join a job site on Buy4You</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Img
                        src={`${process.env.APP_URL}/images/logo.png`}
                        width="170"
                        height="50"
                        alt="Buy4You"
                        style={logo}
                    />
                    <Heading style={heading}>Job Site Invitation</Heading>
                    <Section style={section}>
                        <Text style={text}>
                            {inviterName} has invited you to join the job site "{jobSiteName}" on Buy4You.
                        </Text>
                        <Text style={text}>
                            Click the button below or scan the QR code to accept the invitation:
                        </Text>
                        <Link href={invitationLink} style={button}>
                            Accept Invitation
                        </Link>
                        <Img
                            src={qrCodeUrl}
                            width="200"
                            height="200"
                            alt="QR Code"
                            style={qrCode}
                        />
                        <Text style={text}>
                            This invitation will expire on {expiryDate}.
                        </Text>
                    </Section>
                    <Text style={footer}>
                        If you did not expect this invitation, please ignore this email.
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

const qrCode = {
    margin: '0 auto 20px',
    display: 'block',
};

const footer = {
    fontSize: '12px',
    color: '#898989',
    textAlign: 'center' as const,
    padding: '0 48px',
};

export default JobSiteInvitationEmail; 