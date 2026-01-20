import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const { clinicId } = await params;
    const { searchParams } = new URL(request.url);
    
    // フィルターパラメータ
    const dateFilter = searchParams.get('date'); // 'today', 'yesterday', or ISO date string
    const symptomFilter = searchParams.get('symptom'); // symptom value
    const nameFilter = searchParams.get('name'); // name search (partial match)
    
    // 日付フィルターの計算
    let dateFrom: string | null = null;
    let dateTo: string | null = null;
    
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFrom = today.toISOString();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateTo = tomorrow.toISOString();
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      dateFrom = yesterday.toISOString();
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);
      dateTo = today.toISOString();
    } else if (dateFilter) {
      // 任意の日付（YYYY-MM-DD形式）
      const selectedDate = new Date(dateFilter);
      selectedDate.setHours(0, 0, 0, 0);
      dateFrom = selectedDate.toISOString();
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateTo = nextDay.toISOString();
    }
    
    // 問診票レスポンスを取得
    let query = supabaseAdmin
      .from('questionnaire_responses')
      .select('id, clinic_id, locale, data, created_at')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
    
    // 日付フィルターを適用
    if (dateFrom && dateTo) {
      query = query.gte('created_at', dateFrom).lt('created_at', dateTo);
    }
    
    const { data: responses, error } = await query;
    
    if (error) {
      console.error('Error fetching questionnaire responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaire responses' },
        { status: 500 }
      );
    }
    
    // 症状フィルターと名前フィルターを適用（データ側でフィルタリング）
    let filteredResponses = responses || [];
    if (symptomFilter) {
      filteredResponses = filteredResponses.filter((response) => {
        const symptoms = response.data?.symptoms || [];
        return Array.isArray(symptoms) && symptoms.includes(symptomFilter);
      });
    }
    if (nameFilter) {
      const nameFilterLower = nameFilter.toLowerCase();
      filteredResponses = filteredResponses.filter((response) => {
        const name = response.data?.name || '';
        return name.toLowerCase().includes(nameFilterLower);
      });
    }
    
    // フォーマット
    const formattedResponses = filteredResponses.map((response) => {
      const data = response.data || {};
      const symptoms = Array.isArray(data.symptoms) ? data.symptoms : [];
      // 主要な症状のみ抽出（最初の3つまで）
      const mainSymptoms = symptoms.slice(0, 3).join(', ');
      
      return {
        id: response.id,
        created_at: response.created_at,
        name: data.name || '（未入力）',
        symptoms: mainSymptoms || 'なし',
        locale: response.locale || 'ja',
      };
    });
    
    return NextResponse.json({
      questionnaires: formattedResponses,
      total: formattedResponses.length,
    });
  } catch (error) {
    console.error('Error in GET /api/clinic/[clinicId]/admin/questionnaires:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
