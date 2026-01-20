import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; responseId: string }> }
) {
  try {
    const { clinicId, responseId } = await params;
    
    // 問診票レスポンスを取得
    const { data: response, error } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*')
      .eq('id', responseId)
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
    console.error('Error in GET /api/clinic/[clinicId]/admin/questionnaires/[responseId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
