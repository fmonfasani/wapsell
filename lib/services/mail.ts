import { Resend } from 'resend';
import VerificationEmail from '@/lib/email-templates/verification-email';
import PasswordResetEmail from '@/lib/email-templates/password-reset';
import OrderConfirmationEmail from '@/lib/email-templates/order-confirmation';
import WelcomeEmail from '@/lib/email-templates/welcome-email';
import { render } from '@react-email/render';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not defined');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@wapsell.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'Wapsell';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface VerificationEmailData {
  token: string;
  expiresIn?: string;
}

export interface PasswordResetData {
  resetLink: string;
  expiresIn?: string;
}

export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  currency?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface WelcomeEmailData {
  userName: string;
  loginUrl?: string;
}

export class MailService {
  /**
   * Send a generic email
   */
  async sendEmail(options: SendEmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`MailService.sendEmail failed: ${message}`);
    }
  }

  /**
   * Send verification email with token
   */
  async sendVerificationEmail(email: string, data: VerificationEmailData) {
    try {
      const html = render(VerificationEmail(data));

      return await this.sendEmail({
        to: email,
        subject: 'Verify your email address - Wapsell',
        html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `MailService.sendVerificationEmail failed: ${message}`
      );
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, data: PasswordResetData) {
    try {
      const html = render(PasswordResetEmail(data));

      return await this.sendEmail({
        to: email,
        subject: 'Reset your Wapsell password',
        html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`MailService.sendPasswordReset failed: ${message}`);
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(email: string, data: OrderConfirmationData) {
    try {
      const html = render(OrderConfirmationEmail(data));

      return await this.sendEmail({
        to: email,
        subject: `Order confirmation #${data.orderId} - Wapsell`,
        html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `MailService.sendOrderConfirmation failed: ${message}`
      );
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, data: WelcomeEmailData) {
    try {
      const html = render(WelcomeEmail(data));

      return await this.sendEmail({
        to: email,
        subject: 'Welcome to Wapsell',
        html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`MailService.sendWelcomeEmail failed: ${message}`);
    }
  }
}

export default new MailService();
