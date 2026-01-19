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
  if (!payload || !payload.clinic_id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const clinicId = payload.clinic_id;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

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

    // Get total count for this clinic
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
