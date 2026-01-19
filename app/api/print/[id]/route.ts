import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get questionnaire response to retrieve clinic_id
    const { data: response, error: responseError } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('clinic_id')
      .eq('id', id)
      .single();

    if (responseError || !response) {
      return NextResponse.json(
        { error: 'Questionnaire response not found' },
        { status: 404 }
      );
    }

    // Get printer email from clinic_settings table
    const { data: clinicSetting, error: settingError } = await supabaseAdmin
      .from('clinic_settings')
      .select('printer_email')
      .eq('clinic_id', response.clinic_id)
      .single();

    // Fallback to environment variable if clinic setting is not found
    let printerEmail: string | null = null;
    
    if (clinicSetting && clinicSetting.printer_email) {
      printerEmail = clinicSetting.printer_email;
    } else {
      // Fallback to environment variable for backward compatibility
      printerEmail = process.env.PRINTER_EMAIL || null;
    }

    if (!printerEmail) {
      return NextResponse.json(
        { 
          error: 'Printer email not configured',
          details: `Please configure printer email for clinic "${response.clinic_id}" in clinic_settings table or set PRINTER_EMAIL environment variable`,
        },
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
