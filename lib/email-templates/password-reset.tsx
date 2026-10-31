import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Section,
  Hr,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetLink: string;
  expiresIn?: string;
}

export default function PasswordResetEmail({
  resetLink,
  expiresIn = '1 hour',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Reset Your Password</Heading>
          </Section>

          <Section style={contentStyle}>
            <Text style={paragraphStyle}>
              We received a request to reset the password for your Wapsell
              account. Click the button below to create a new password.
            </Text>

            <Section style={buttonContainerStyle}>
              <Link href={resetLink} style={buttonStyle}>
                Reset Password
              </Link>
            </Section>

            <Text style={paragraphStyle}>
              Or copy and paste this link in your browser:
            </Text>
            <Link href={resetLink} style={linkStyle}>
              {resetLink}
            </Link>

            <Hr style={hrStyle} />

            <Text style={warningStyle}>
              This password reset link will expire in {expiresIn}.
            </Text>
            <Text style={smallTextStyle}>
              If you didn't request a password reset, please ignore this email
              and your password will remain unchanged.
            </Text>
            <Text style={smallTextStyle}>
              For security reasons, we'll never ask for your password in an
              email.
            </Text>
          </Section>

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © 2025 Wapsell. All rights reserved.
            </Text>
            <Text style={footerTextStyle}>
              Wapsell — AI WhatsApp sales agent for premium real estate
            </Text>
          </Section>
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
  backgroundColor: '#d32f2f',
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
  backgroundColor: '#d32f2f',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '16px',
};

const linkStyle = {
  color: '#d32f2f',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  fontSize: '14px',
};

const hrStyle = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const warningStyle = {
  fontSize: '14px',
  color: '#d32f2f',
  fontWeight: 'bold',
  margin: '10px 0',
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
