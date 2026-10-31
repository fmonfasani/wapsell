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

interface WelcomeEmailProps {
  userName: string;
  loginUrl?: string;
}

export default function WelcomeEmail({
  userName,
  loginUrl = 'https://wapsell.com/login',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Welcome to Wapsell</Heading>
          </Section>

          <Section style={contentStyle}>
            <Text style={paragraphStyle}>Hi {userName},</Text>

            <Text style={paragraphStyle}>
              Welcome to Wapsell! We're excited to have you on board. Your
              account is now ready to use.
            </Text>

            <Text style={paragraphStyle}>
              Wapsell is an AI-powered WhatsApp sales agent designed for premium
              real estate. Start connecting with your customers and closing deals
              faster.
            </Text>

            <Section style={buttonContainerStyle}>
              <Link href={loginUrl} style={buttonStyle}>
                Get Started
              </Link>
            </Section>

            <Hr style={hrStyle} />

            <Text style={subtitleStyle}>What's next?</Text>
            <Text style={bulletStyle}>
              • Configure your WhatsApp Business Account
            </Text>
            <Text style={bulletStyle}>• Set up your property listings</Text>
            <Text style={bulletStyle}>• Customize your greeting messages</Text>
            <Text style={bulletStyle}>
              • Enable AI responses for customer inquiries
            </Text>

            <Hr style={hrStyle} />

            <Text style={smallTextStyle}>
              If you have any questions, our support team is here to help. Reply
              to this email or visit our help center.
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
  backgroundColor: '#16a34a',
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
  backgroundColor: '#16a34a',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '16px',
};

const subtitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '20px 0 10px 0',
};

const bulletStyle = {
  fontSize: '15px',
  color: '#555555',
  margin: '8px 0',
  paddingLeft: '20px',
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
