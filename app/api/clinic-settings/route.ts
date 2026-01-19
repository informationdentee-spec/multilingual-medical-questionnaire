import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * GET /api/clinic-settings?clinic_id=xxx
 * Get clinic settings for a specific clinic
 * Note: GET is public (no authentication required) for flexibility
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id parameter is required' },
        { status: 400 }
      );
    }

    const { data: setting, error } = await supabaseAdmin
      .from('clinic_settings')
      .select('*')
      .eq('clinic_id', clinicId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching clinic settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clinic settings' },
        { status: 500 }
      );
    }

    // Don't return password hash in response
    const { admin_password_hash, ...safeSetting } = setting || {};

    return NextResponse.json({
      clinic_id: clinicId,
      printer_email: setting?.printer_email || null,
      admin_email: setting?.admin_email || null,
      exists: !!setting,
    });
  } catch (error) {
    console.error('Error in GET /api/clinic-settings:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clinic-settings
 * Create or update clinic settings
 * Body: { clinic_id: string, printer_email: string }
 * Requires: Authentication (JWT token in cookie)
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.clinic_id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid token' },
        { status: 401 }
      );
    }

    const authenticatedClinicId = payload.clinic_id;

    const body = await request.json();
    const { clinic_id, printer_email, admin_email, admin_password } = body;

    // Users can only update their own clinic settings
    if (clinic_id && clinic_id !== authenticatedClinicId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'You can only update your own clinic settings' },
        { status: 403 }
      );
    }

    // Use authenticated clinic_id if not provided
    const targetClinicId = clinic_id || authenticatedClinicId;

    // Build update data
    const updateData: any = {
      clinic_id: targetClinicId,
      updated_at: new Date().toISOString(),
    };

    if (printer_email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(printer_email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      updateData.printer_email = printer_email;
    }

    if (admin_email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(admin_email)) {
        return NextResponse.json(
          { error: 'Invalid admin email format' },
          { status: 400 }
        );
      }
      updateData.admin_email = admin_email;
    }

    if (admin_password !== undefined) {
      // Hash password if provided
      const { hashPassword } = await import('@/lib/auth/password');
      updateData.admin_password_hash = await hashPassword(admin_password);
    }

    // Upsert clinic settings
    const { data, error } = await supabaseAdmin
      .from('clinic_settings')
      .upsert(updateData, {
        onConflict: 'clinic_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting clinic settings:', error);
      return NextResponse.json(
        { 
          error: 'Failed to save clinic settings',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Don't return password hash in response
    const { admin_password_hash, ...responseData } = data;

    return NextResponse.json({
      success: true,
      message: 'Clinic settings saved successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Error in POST /api/clinic-settings:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clinic-settings?clinic_id=xxx
 * Delete clinic settings
 * Requires: Authentication (JWT token in cookie)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.clinic_id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid token' },
        { status: 401 }
      );
    }

    const authenticatedClinicId = payload.clinic_id;
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    // Users can only delete their own clinic settings
    if (!clinicId || clinicId !== authenticatedClinicId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'You can only delete your own clinic settings' },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from('clinic_settings')
      .delete()
      .eq('clinic_id', clinicId);

    if (error) {
      console.error('Error deleting clinic settings:', error);
      return NextResponse.json(
        { 
          error: 'Failed to delete clinic settings',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Clinic settings deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/clinic-settings:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
