import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id, template_id')
      .eq('slug', params.slug)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('form_templates')
      .select('questions_json')
      .eq('id', tenant.template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      questions_json: template.questions_json,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
