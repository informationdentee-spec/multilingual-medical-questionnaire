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

    // Get clinic settings by admin email
    const { data: clinicSettings, error: clinicError } = await supabaseAdmin
      .from('clinic_settings')
      .select('clinic_id, admin_email, admin_password_hash')
      .eq('admin_email', email)
      .single();

    if (clinicError || !clinicSettings || !clinicSettings.admin_email || !clinicSettings.admin_password_hash) {
      console.error('Login error - clinic admin not found:', clinicError);
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, clinicSettings.admin_password_hash);
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
      email: email,
      clinic_id: clinicSettings.clinic_id,
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
      email: email,
      clinic_id: clinicSettings.clinic_id,
    });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
