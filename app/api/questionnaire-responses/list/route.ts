import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  const tenantId = await getAuthenticatedTenant();
  
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return handler(request, tenantId);
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

async function handler(request: NextRequest, tenantId: string) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

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

    // Get questionnaire responses for this clinic
    const { data: responses, error } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('id, clinic_id, locale, data, created_at')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching questionnaire responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaire responses' },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    // Format responses for display
    const formattedResponses = (responses || []).map((response) => ({
      id: response.id,
      clinic_id: response.clinic_id,
      locale: response.locale,
      name: response.data?.name || '（未入力）',
      created_at: response.created_at,
    }));

    return NextResponse.json({
      questionnaires: formattedResponses,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/questionnaire-responses/list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
