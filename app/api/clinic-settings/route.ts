import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedTenant } from '@/lib/middleware/auth';

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

    return NextResponse.json({
      clinic_id: clinicId,
      printer_email: setting?.printer_email || null,
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
    const tenantId = await getAuthenticatedTenant(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clinic_id, printer_email } = body;

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    if (!printer_email) {
      return NextResponse.json(
        { error: 'printer_email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(printer_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Upsert clinic settings
    const { data, error } = await supabaseAdmin
      .from('clinic_settings')
      .upsert(
        {
          clinic_id,
          printer_email,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'clinic_id',
        }
      )
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

    return NextResponse.json({
      success: true,
      message: 'Clinic settings saved successfully',
      data,
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
    const tenantId = await getAuthenticatedTenant(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id parameter is required' },
        { status: 400 }
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
