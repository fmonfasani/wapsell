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
  Row,
  Column,
} from '@react-email/components';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  currency?: string;
  items?: OrderItem[];
}

export default function OrderConfirmationEmail({
  orderId,
  customerName,
  orderDate,
  totalAmount,
  currency = 'USD',
  items = [],
}: OrderConfirmationEmailProps) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://wapsell.com'}/dashboard`;

  const currencySymbol = currency === 'USD' ? '$' : currency;
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(totalAmount);

  return (
    <Html>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Order Confirmed!</Heading>
          </Section>

          <Section style={contentStyle}>
            <Text style={paragraphStyle}>Hi {customerName},</Text>
            <Text style={paragraphStyle}>
              Thank you for your order! We're excited to help you. Your order
              has been confirmed and is now being processed.
            </Text>

            <Section style={orderInfoStyle}>
              <Row>
                <Column style={infoColumnStyle}>
                  <Text style={labelStyle}>Order ID</Text>
                  <Text style={valueStyle}>{orderId}</Text>
                </Column>
                <Column style={infoColumnStyle}>
                  <Text style={labelStyle}>Order Date</Text>
                  <Text style={valueStyle}>{orderDate}</Text>
                </Column>
              </Row>
            </Section>

            {items && items.length > 0 && (
              <Section style={itemsContainerStyle}>
                <Text style={sectionHeadingStyle}>Order Details</Text>

                {items.map((item, index) => (
                  <Row key={index} style={itemRowStyle}>
                    <Column style={itemNameColumnStyle}>
                      <Text style={itemNameStyle}>{item.name}</Text>
                    </Column>
                    <Column style={itemQtyColumnStyle}>
                      <Text style={itemTextStyle}>Qty: {item.quantity}</Text>
                    </Column>
                    <Column style={itemPriceColumnStyle}>
                      <Text style={itemPriceStyle}>
                        {currencySymbol}
                        {item.price.toFixed(2)}
                      </Text>
                    </Column>
                  </Row>
                ))}

                <Hr style={hrStyle} />

                <Row style={totalRowStyle}>
                  <Column style={totalLabelColumnStyle}>
                    <Text style={totalLabelStyle}>Total Amount</Text>
                  </Column>
                  <Column style={totalValueColumnStyle}>
                    <Text style={totalValueStyle}>{formattedTotal}</Text>
                  </Column>
                </Row>
              </Section>
            )}

            {!items || items.length === 0 ? (
              <Section style={totalContainerStyle}>
                <Text style={labelStyle}>Total Amount</Text>
                <Text style={totalAmountStyle}>{formattedTotal}</Text>
              </Section>
            ) : null}

            <Hr style={hrStyle} />

            <Text style={paragraphStyle}>
              You can track your order and view details in your account
              dashboard:
            </Text>

            <Section style={buttonContainerStyle}>
              <Link href={dashboardUrl} style={buttonStyle}>
                View Dashboard
              </Link>
            </Section>

            <Text style={smallTextStyle}>
              If you have any questions about your order, please don't hesitate
              to contact our support team.
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
  backgroundColor: '#27ae60',
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

const orderInfoStyle = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
};

const infoColumnStyle = {
  padding: '10px',
  width: '50%',
};

const labelStyle = {
  fontSize: '12px',
  color: '#999999',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  margin: '0 0 5px 0',
};

const valueStyle = {
  fontSize: '16px',
  color: '#333333',
  fontWeight: 'bold',
  margin: 0,
};

const itemsContainerStyle = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
};

const sectionHeadingStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 15px 0',
};

const itemRowStyle = {
  marginBottom: '10px',
  borderBottom: '1px solid #e5e5e5',
  paddingBottom: '10px',
};

const itemNameColumnStyle = {
  width: '50%',
  paddingRight: '10px',
};

const itemNameStyle = {
  fontSize: '14px',
  color: '#333333',
  margin: 0,
};

const itemQtyColumnStyle = {
  width: '25%',
  textAlign: 'right' as const,
};

const itemPriceColumnStyle = {
  width: '25%',
  textAlign: 'right' as const,
};

const itemTextStyle = {
  fontSize: '14px',
  color: '#666666',
  margin: 0,
};

const itemPriceStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#27ae60',
  margin: 0,
};

const totalRowStyle = {
  marginTop: '10px',
};

const totalLabelColumnStyle = {
  width: '50%',
};

const totalLabelStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  margin: 0,
};

const totalValueColumnStyle = {
  width: '50%',
  textAlign: 'right' as const,
};

const totalValueStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#27ae60',
  margin: 0,
};

const totalContainerStyle = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const totalAmountStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#27ae60',
  margin: '10px 0 0 0',
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
  backgroundColor: '#27ae60',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '16px',
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
