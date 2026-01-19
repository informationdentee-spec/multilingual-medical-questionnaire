import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get printer email from environment variable
    const printerEmail = process.env.PRINTER_EMAIL;
    if (!printerEmail) {
      return NextResponse.json(
        { error: 'PRINTER_EMAIL environment variable is not set' },
        { status: 500 }
      );
    }

    // Get Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    // Get sender email from environment variable (optional, defaults to noreply)
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com';

    // Get app URL for internal API call
    // In production, use the same origin; in development, use localhost
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Fetch PDF from /api/pdf/[id]
    const pdfResponse = await fetch(`${appUrl}/api/pdf/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!pdfResponse.ok) {
      const errorData = await pdfResponse.json().catch(() => ({ error: 'Failed to generate PDF' }));
      return NextResponse.json(
        { 
          error: 'Failed to generate PDF',
          details: errorData.error || 'Unknown error',
        },
        { status: pdfResponse.status }
      );
    }

    // Get PDF as buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Send email with PDF attachment
    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: printerEmail,
      subject: `問診票 - ${id}`,
      html: `
        <p>問診票のPDFを添付いたします。</p>
        <p>ID: ${id}</p>
        <p>このメールは自動送信されています。</p>
      `,
      attachments: [
        {
          filename: `questionnaire-${id}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Error in POST /api/print/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
