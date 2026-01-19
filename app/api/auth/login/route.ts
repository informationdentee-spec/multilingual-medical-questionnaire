import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { isLocked, recordFailedAttempt, clearAttempts } from '@/lib/auth/login-attempts';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if account is locked
    if (isLocked(email)) {
      return NextResponse.json(
        { error: 'Account is temporarily locked. Please try again later.' },
        { status: 429 }
      );
    }

    // Get tenant by email
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (tenantError || !tenant) {
      console.error('Login error - tenant not found:', tenantError);
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, tenant.password_hash);
    if (!isValid) {
      console.error('Login error - password verification failed for:', email);
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Clear failed attempts
    clearAttempts(email);

    // Generate JWT token
    const token = signToken({
      tenant_id: tenant.id,
      email: tenant.email,
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      message: 'Login successful',
      tenant_id: tenant.id,
    });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
