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
    // Get total count for this clinic
    const { count: total } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', today.toISOString());

    // Get this week's count
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    thisWeek.setHours(0, 0, 0, 0);
    const { count: thisWeekCount } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', thisWeek.toISOString());

    // Get this month's count
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const { count: thisMonthCount } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', thisMonth.toISOString());

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
