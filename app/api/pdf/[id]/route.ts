import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generatePDF } from '@/lib/pdf/generator';
import { getTemplate } from '@/lib/templates/get-template';
import { valueToLabel } from '@/lib/templates/value-to-label';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get questionnaire response from questionnaire_responses table
    const { data: response, error: responseError } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*')
      .eq('id', id)
      .single();

    if (responseError || !response) {
      return NextResponse.json(
        { error: 'Questionnaire response not found' },
        { status: 404 }
      );
    }

    // Get template for label conversion
    const template = await getTemplate(response.clinic_id);
    const locale = response.locale || 'ja';

    // Convert JSONB data to formatted data for PDF
    const data = response.data || {};
    
    // Prepare PDF data with proper label conversion
    const pdfData: any = {
      // Basic information
      name: data.name || '',
      sex: data.sex === 'male' ? '男' : data.sex === 'female' ? '女' : '',
      birth_year: data.birth_year || '',
      birth_month: data.birth_month || '',
      birth_day: data.birth_day || '',
      phone: data.phone || '',
      address: data.address || '',
      has_insurance: data.has_insurance === true ? 'あり' : data.has_insurance === false ? 'なし' : '',
      nationality: data.nationality || '',
      // Symptoms
      symptoms: Array.isArray(data.symptoms) 
        ? data.symptoms.map((s: string) => 
            template ? valueToLabel(s, 'symptoms', template, locale) : s
          )
        : [],
      symptom_other: data.symptom_other || '',
      // Allergies
      has_allergy: data.has_allergy === true ? 'あり' : data.has_allergy === false ? 'なし' : '',
      allergy_types: Array.isArray(data.allergy_types)
        ? data.allergy_types.map((a: string) =>
            template ? valueToLabel(a, 'allergy_types', template, locale) : a
          )
        : [],
      allergy_other: data.allergy_other || '',
      // Medication
      is_medicating: data.is_medicating === true ? 'あり' : data.is_medicating === false ? 'なし' : '',
      medication_detail: data.medication_detail || '',
      // Anesthesia, extraction, pregnancy, lactation
      anesthesia_trouble: data.anesthesia_trouble === true ? 'あり' : data.anesthesia_trouble === false ? 'なし' : '',
      has_extraction: data.has_extraction === true ? 'あり' : data.has_extraction === false ? 'なし' : '',
      is_pregnant: data.is_pregnant === true ? 'あり' : data.is_pregnant === false ? 'なし' : '',
      pregnancy_months: data.pregnancy_months || '',
      is_lactating: data.is_lactating === true ? 'あり' : data.is_lactating === false ? 'なし' : '',
      // Medical history
      past_diseases: Array.isArray(data.past_diseases)
        ? data.past_diseases.map((d: string) =>
            template ? valueToLabel(d, 'past_diseases', template, locale) : d
          )
        : [],
      disease_other: data.disease_other || '',
      has_under_treatment: data.has_under_treatment === true ? 'あり' : data.has_under_treatment === false ? 'なし' : '',
      disease_under_treatment_detail: data.disease_under_treatment_detail || '',
      // Treatment preferences
      treatment_preferences: Array.isArray(data.treatment_preferences)
        ? data.treatment_preferences.map((t: string) =>
            template ? valueToLabel(t, 'treatment_preferences', template, locale) : t
          )
        : [],
      treatment_other: data.treatment_other || '',
      // Interpreter
      can_bring_interpreter: data.can_bring_interpreter === true ? 'はい' : data.can_bring_interpreter === false ? 'いいえ' : '',
      // Visit date
      visit_year: data.visit_year || new Date().getFullYear(),
      visit_month: data.visit_month || new Date().getMonth() + 1,
      visit_day: data.visit_day || new Date().getDate(),
    };

    // Read HTML template
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const templatePath = join(process.cwd(), 'lib', 'pdf', 'template.html');
    const htmlTemplate = readFileSync(templatePath, 'utf-8');

    // Generate PDF
    const pdfBuffer = await generatePDF({
      template: htmlTemplate,
      data: pdfData,
    });

    // Return PDF as binary
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="questionnaire-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
