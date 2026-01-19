import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const clinicId = searchParams.get('clinic_id');
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabaseAdmin
      .from('questionnaire_responses')
      .select('id, clinic_id, locale, data, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    // Get questionnaire responses
    const { data: responses, error } = await query;

    if (error) {
      console.error('Error fetching questionnaire responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaire responses' },
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true });
    if (clinicId) {
      countQuery = countQuery.eq('clinic_id', clinicId);
    }
    const { count } = await countQuery;

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
