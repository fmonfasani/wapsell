import { NextRequest, NextResponse } from 'next/server';
import mailService, {
  VerificationEmailData,
  PasswordResetData,
  OrderConfirmationData,
  WelcomeEmailData,
} from '@/lib/services/mail';

export const runtime = 'nodejs';

interface SendMailRequest {
  to: string;
  type: 'verification' | 'password-reset' | 'order-confirmation' | 'welcome';
  data: VerificationEmailData | PasswordResetData | OrderConfirmationData | WelcomeEmailData;
}

/**
 * POST /api/mail/send
 *
 * Send emails via Resend
 *
 * Request body:
 * {
 *   "to": "user@example.com",
 *   "type": "verification|password-reset|order-confirmation|welcome",
 *   "data": { ... email-specific data ... }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "messageId": "string"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Parse request body
    let body: SendMailRequest;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.to || !body.type || !body.data) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type, data' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    let result;

    // Route to appropriate service method based on email type
    switch (body.type) {
      case 'verification':
        result = await mailService.sendVerificationEmail(
          body.to,
          body.data as VerificationEmailData
        );
        break;

      case 'password-reset':
        result = await mailService.sendPasswordReset(
          body.to,
          body.data as PasswordResetData
        );
        break;

      case 'order-confirmation':
        result = await mailService.sendOrderConfirmation(
          body.to,
          body.data as OrderConfirmationData
        );
        break;

      case 'welcome':
        result = await mailService.sendWelcomeEmail(
          body.to,
          body.data as WelcomeEmailData
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${body.type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/mail/send] Error:', message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * Catch unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}
