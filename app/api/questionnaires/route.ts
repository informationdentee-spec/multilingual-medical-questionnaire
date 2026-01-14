import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, language, ...formData } = body;

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id, template_id')
      .eq('slug', slug)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get current date for visit date
    const now = new Date();
    const visitYear = formData.visit_year || now.getFullYear();
    const visitMonth = formData.visit_month || now.getMonth() + 1;
    const visitDay = formData.visit_day || now.getDate();

    // Insert questionnaire
    const { data: questionnaire, error: insertError } = await supabaseAdmin
      .from('questionnaires')
      .insert({
        tenant_id: tenant.id,
        template_id: tenant.template_id,
        language,
        pdf_generating: true,
        ...formData,
        visit_year: visitYear,
        visit_month: visitMonth,
        visit_day: visitDay,
      })
      .select()
      .single();

    if (insertError || !questionnaire) {
      console.error('Error inserting questionnaire:', insertError);
      return NextResponse.json(
        { error: 'Failed to save questionnaire' },
        { status: 500 }
      );
    }

    // Trigger PDF generation asynchronously (don't await)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const internalToken = process.env.INTERNAL_API_TOKEN || '';
    
    fetch(`${appUrl}/api/pdf/generate/${questionnaire.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${internalToken}`,
      },
    }).catch((error) => {
      console.error('PDF generation failed:', error);
    });

    return NextResponse.json({
      id: questionnaire.id,
      message: 'Questionnaire saved successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/questionnaires:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
