import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Section,
  Hr,
  Footer,
} from '@react-email/components';

interface VerificationEmailProps {
  token: string;
  expiresIn?: string;
}

export default function VerificationEmail({
  token,
  expiresIn = '24 hours',
}: VerificationEmailProps) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://wapsell.com'}/verify?token=${token}`;

  return (
    <Html>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Verify Your Email Address</Heading>
          </Section>

          <Section style={contentStyle}>
            <Text style={paragraphStyle}>
              Welcome to Wapsell! To get started, please verify your email
              address by clicking the button below.
            </Text>

            <Section style={buttonContainerStyle}>
              <Link href={verificationUrl} style={buttonStyle}>
                Verify Email Address
              </Link>
            </Section>

            <Text style={paragraphStyle}>
              Or copy and paste this link in your browser:
            </Text>
            <Link href={verificationUrl} style={linkStyle}>
              {verificationUrl}
            </Link>

            <Hr style={hrStyle} />

            <Text style={smallTextStyle}>
              This verification link will expire in {expiresIn}.
            </Text>
            <Text style={smallTextStyle}>
              If you didn't create this account, please ignore this email.
            </Text>
          </Section>

          <Footer style={footerStyle}>
            <Text style={footerTextStyle}>
              © 2025 Wapsell. All rights reserved.
            </Text>
            <Text style={footerTextStyle}>
              Wapsell — AI WhatsApp sales agent for premium real estate
            </Text>
          </Footer>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  backgroundColor: '#f5f5f5',
  margin: 0,
  padding: 0,
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
};

const headerStyle = {
  backgroundColor: '#0066cc',
  padding: '30px 20px',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
};

const headingStyle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: 0,
};

const contentStyle = {
  padding: '30px 20px',
};

const paragraphStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '15px 0',
};

const buttonContainerStyle = {
  margin: '30px 0',
  textAlign: 'center' as const,
};

const buttonStyle = {
  display: 'inline-block',
  padding: '12px 32px',
  backgroundColor: '#0066cc',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '16px',
};

const linkStyle = {
  color: '#0066cc',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  fontSize: '14px',
};

const hrStyle = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const smallTextStyle = {
  fontSize: '13px',
  color: '#999999',
  margin: '10px 0',
};

const footerStyle = {
  padding: '20px',
  borderTop: '1px solid #e5e5e5',
  backgroundColor: '#f9f9f9',
  borderRadius: '0 0 8px 8px',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  fontSize: '12px',
  color: '#999999',
  margin: '5px 0',
};
