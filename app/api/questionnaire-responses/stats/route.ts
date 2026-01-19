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
    // Get optional clinic_id filter from query params
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    // Build query
    let query = supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true });

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    // Get total count
    const { count: total } = await query;

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let todayQuery = supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
    if (clinicId) {
      todayQuery = todayQuery.eq('clinic_id', clinicId);
    }
    const { count: todayCount } = await todayQuery;

    // Get this week's count
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    thisWeek.setHours(0, 0, 0, 0);
    let thisWeekQuery = supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisWeek.toISOString());
    if (clinicId) {
      thisWeekQuery = thisWeekQuery.eq('clinic_id', clinicId);
    }
    const { count: thisWeekCount } = await thisWeekQuery;

    // Get this month's count
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    let thisMonthQuery = supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonth.toISOString());
    if (clinicId) {
      thisMonthQuery = thisMonthQuery.eq('clinic_id', clinicId);
    }
    const { count: thisMonthCount } = await thisMonthQuery;

    return NextResponse.json({
      total: total || 0,
      today: todayCount || 0,
      thisWeek: thisWeekCount || 0,
      thisMonth: thisMonthCount || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/questionnaire-responses/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
