import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get all unused, non-expired tokens for this tenant
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

    // Get clinic_id from clinic_settings using admin_email
    // Note: password_reset_tokens still uses tenant_id, but we need to map it to clinic_id
    // For now, return clinic_id as null since we don't have the mapping
    // This endpoint may need to be updated to work with clinic_settings instead of tenants
    return NextResponse.json({
      valid: true,
      clinic_id: null, // TODO: Map tenant_id to clinic_id if needed
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
