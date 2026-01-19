import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenantId = await getAuthenticatedTenant();
  
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return handler(request, { params }, tenantId);
}

async function getAuthenticatedTenant(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload?.tenant_id || null;
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  tenantId: string
) {
  try {
    const { id } = await params;

    // Get tenant's clinic_id (slug) from tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('slug')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const clinicId = tenant.slug;

    // Get questionnaire response
    const { data: response, error } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*')
      .eq('id', id)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !response) {
      return NextResponse.json(
        { error: 'Questionnaire response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/questionnaire-responses/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
