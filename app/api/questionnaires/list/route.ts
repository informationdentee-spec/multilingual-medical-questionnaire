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

    // Get questionnaires for this tenant
    const { data: questionnaires, error } = await supabaseAdmin
      .from('questionnaires')
      .select('id, name, language, created_at, pdf_url, pdf_generating')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching questionnaires:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaires' },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('questionnaires')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    return NextResponse.json({
      questionnaires: questionnaires || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/questionnaires/list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

