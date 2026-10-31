import { MailService } from './mail';
import { Resend } from 'resend';

// Mock the resend module
jest.mock('resend');
jest.mock('@react-email/render', () => ({
  render: jest.fn((component) => '<html>test email</html>'),
}));

describe('MailService', () => {
  let mailService: MailService;
  let mockResendInstance: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock the Resend constructor
    mockResendInstance = {
      emails: {
        send: jest.fn(),
      },
    };

    (Resend as jest.Mock).mockImplementation(() => mockResendInstance);

    // Create new instance for each test
    mailService = new MailService();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with token', async () => {
      const email = 'user@example.com';
      const token = 'test-token-123';
      const mockMessageId = 'msg_123';

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: mockMessageId },
        error: null,
      });

      const result = await mailService.sendVerificationEmail(email, {
        token,
      });

      expect(result).toEqual({
        success: true,
        messageId: mockMessageId,
      });

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: expect.stringContaining('Verify'),
          html: expect.any(String),
        })
      );
    });

    it('should throw error when Resend fails', async () => {
      const email = 'user@example.com';
      const token = 'test-token-123';

      mockResendInstance.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      await expect(
        mailService.sendVerificationEmail(email, { token })
      ).rejects.toThrow();
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      const email = 'user@example.com';
      const resetLink = 'https://wapsell.com/reset?token=abc123';
      const mockMessageId = 'msg_456';

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: mockMessageId },
        error: null,
      });

      const result = await mailService.sendPasswordReset(email, {
        resetLink,
      });

      expect(result).toEqual({
        success: true,
        messageId: mockMessageId,
      });

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: expect.stringContaining('password'),
          html: expect.any(String),
        })
      );
    });
  });

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const email = 'user@example.com';
      const mockMessageId = 'msg_789';

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: mockMessageId },
        error: null,
      });

      const result = await mailService.sendOrderConfirmation(email, {
        orderId: 'ORD-123',
        customerName: 'John Doe',
        orderDate: '2025-10-26',
        totalAmount: 1500.00,
        currency: 'USD',
        items: [
          { name: 'Property Tour', quantity: 1, price: 1500.00 },
        ],
      });

      expect(result).toEqual({
        success: true,
        messageId: mockMessageId,
      });

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: expect.stringContaining('Order confirmation'),
          html: expect.any(String),
        })
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const email = 'user@example.com';
      const mockMessageId = 'msg_101';

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: mockMessageId },
        error: null,
      });

      const result = await mailService.sendWelcomeEmail(email, {
        userName: 'John Doe',
      });

      expect(result).toEqual({
        success: true,
        messageId: mockMessageId,
      });

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: expect.stringContaining('Welcome'),
          html: expect.any(String),
        })
      );
    });
  });

  describe('sendEmail', () => {
    it('should send generic email', async () => {
      const mockMessageId = 'msg_generic';

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: mockMessageId },
        error: null,
      });

      const result = await mailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      });

      expect(result).toEqual({
        success: true,
        messageId: mockMessageId,
      });
    });

    it('should include replyTo when provided', async () => {
      const mockMessageId = 'msg_reply';

      mockResendInstance.emails.send.mockResolvedValue({
        data: { id: mockMessageId },
        error: null,
      });

      await mailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        replyTo: 'support@wapsell.com',
      });

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: 'support@wapsell.com',
        })
      );
    });
  });
});
