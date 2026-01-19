import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPassword, hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json();

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, new password, and confirm password are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Get all unused, non-expired tokens
    const { data: resetTokens, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString());

    if (tokenError || !resetTokens) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Verify token against all possible hashes
    let validToken = null;
    for (const resetToken of resetTokens) {
      const isValid = await verifyPassword(token, resetToken.token_hash);
      if (isValid) {
        validToken = resetToken;
        break;
      }
    }

    if (!validToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password in clinic_settings
    // Note: password_reset_tokens uses tenant_id which is actually clinic_id in our case
    const { error: updateError } = await supabaseAdmin
      .from('clinic_settings')
      .update({ admin_password_hash: passwordHash })
      .eq('clinic_id', validToken.tenant_id); // tenant_id is actually clinic_id

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', validToken.id);

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error completing password reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
