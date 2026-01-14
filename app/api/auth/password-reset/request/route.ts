import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateResetToken, hashToken } from '@/lib/auth/token';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get tenant by email
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id, email')
      .eq('email', email)
      .single();

    // Don't reveal if email exists or not (security best practice)
    if (tenantError || !tenant) {
      return NextResponse.json({
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const token = await generateResetToken();
    const tokenHash = await hashToken(token);

    // Calculate expiration (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Save token to database
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        tenant_id: tenant.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (tokenError) {
      console.error('Error saving reset token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create reset token' },
        { status: 500 }
      );
    }

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/admin/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
        to: tenant.email,
        subject: 'パスワード再設定のご案内',
        html: `
          <h2>パスワード再設定のご案内</h2>
          <p>以下のリンクをクリックして、パスワードを再設定してください。</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>このリンクは30分間有効です。</p>
          <p>心当たりがない場合は、このメールを無視してください。</p>
        `,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'If the email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Error in password reset request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
