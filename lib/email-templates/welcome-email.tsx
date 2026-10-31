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

interface WelcomeEmailProps {
  userName: string;
  loginUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wapsell.com';

export default function WelcomeEmail({
  userName,
  loginUrl = `${baseUrl}/auth/login`,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Welcome to Wapsell!</Heading>
          </Section>

          <Section style={contentStyle}>
            <Text style={paragraphStyle}>Hi {userName},</Text>
            <Text style={paragraphStyle}>
              Welcome to Wapsell, the AI-powered WhatsApp sales agent for
              premium real estate. We are thrilled to have you on board!
            </Text>

            <Text style={paragraphStyle}>With Wapsell, you can:</Text>

            <ul style={listStyle}>
              <li style={listItemStyle}>
                Automate your sales conversations on WhatsApp
              </li>
              <li style={listItemStyle}>
                Qualify leads with AI-powered conversations
              </li>
              <li style={listItemStyle}>
                Schedule property viewings and follow-ups
              </li>
              <li style={listItemStyle}>
                Get real-time insights into customer behavior
              </li>
              <li style={listItemStyle}>
                Integrate seamlessly with your existing tools
              </li>
            </ul>

            <Hr style={hrStyle} />

            <Text style={paragraphStyle}>
              Ready to get started? Sign in to your account to explore all the
              features and set up your first sales conversation.
            </Text>

            <Section style={buttonContainerStyle}>
              <Link href={loginUrl} style={buttonStyle}>
                Sign In to Wapsell
              </Link>
            </Section>

            <Hr style={hrStyle} />

            <Section style={resourcesStyle}>
              <Text style={sectionHeadingStyle}>Quick Resources</Text>

              <Text style={resourceLinkStyle}>
                <Link href={`${baseUrl}/docs`} style={linkStyle}>
                  Documentation
                </Link>
              </Text>

              <Text style={resourceLinkStyle}>
                <Link href={`${baseUrl}/support`} style={linkStyle}>
                  Support Center
                </Link>
              </Text>

              <Text style={resourceLinkStyle}>
                <Link href={`${baseUrl}/community`} style={linkStyle}>
                  Community Forum
                </Link>
              </Text>
            </Section>

            <Hr style={hrStyle} />

            <Text style={smallTextStyle}>
              Questions? Our support team is here to help. Reply to this email
              or visit our support center anytime.
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

const listStyle = {
  paddingLeft: '20px',
  margin: '15px 0',
};

const listItemStyle = {
  fontSize: '14px',
  color: '#333333',
  margin: '8px 0',
  lineHeight: '1.6',
};

const hrStyle = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
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

const resourcesStyle = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
};

const sectionHeadingStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 15px 0',
  textTransform: 'uppercase' as const,
};

const resourceLinkStyle = {
  fontSize: '14px',
  margin: '8px 0',
};

const linkStyle = {
  color: '#0066cc',
  textDecoration: 'underline',
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
