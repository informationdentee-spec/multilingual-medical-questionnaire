import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Get questionnaire response for this clinic
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
