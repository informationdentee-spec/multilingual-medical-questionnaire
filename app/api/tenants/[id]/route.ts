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
  authenticatedTenantId: string
) {
  try {
    const { id } = await params;

    // Verify that the authenticated tenant is requesting their own data
    if (id !== authenticatedTenantId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get tenant
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .select('id, name, slug, email, created_at')
      .eq('id', id)
      .single();

    if (error || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Error in GET /api/tenants/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
