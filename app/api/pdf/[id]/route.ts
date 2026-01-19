import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generatePDF } from '@/lib/pdf/generator';
import { getTemplate } from '@/lib/templates/get-template';
import { valueToLabel } from '@/lib/templates/value-to-label';
import { PDF_TEMPLATE } from '@/lib/pdf/template';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[PDF API] Starting PDF generation for ID:', id);

    // Step 1: Get questionnaire response from database
    console.log('[PDF API] Step 1: Fetching questionnaire response...');
    const { data: response, error: responseError } = await supabaseAdmin
      .from('questionnaire_responses')
      .select('*')
      .eq('id', id)
      .single();

    if (responseError) {
      console.error('[PDF API] Error fetching questionnaire response:', responseError);
      return NextResponse.json(
        { 
          error: 'Questionnaire response not found',
          details: responseError.message,
        },
        { status: 404 }
      );
    }

    if (!response) {
      console.error('[PDF API] Questionnaire response not found for ID:', id);
      return NextResponse.json(
        { error: 'Questionnaire response not found' },
        { status: 404 }
      );
    }

    console.log('[PDF API] Questionnaire response found:', {
      id: response.id,
      clinic_id: response.clinic_id,
      locale: response.locale,
    });

    // Step 2: Get template for label conversion
    console.log('[PDF API] Step 2: Getting template for clinic_id:', response.clinic_id);
    let template;
    try {
      template = await getTemplate(response.clinic_id);
      console.log('[PDF API] Template retrieved:', template ? 'found' : 'not found');
    } catch (templateError) {
      console.warn('[PDF API] Error getting template (continuing without template):', templateError);
      template = null;
    }

    const locale = response.locale || 'ja';
    console.log('[PDF API] Using locale:', locale);

    // Step 3: Convert JSONB data to formatted data for PDF
    console.log('[PDF API] Step 3: Converting data...');
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

    console.log('[PDF API] Data conversion completed');

    // Step 4: Get HTML template
    // Note: Using imported template constant instead of reading from filesystem
    // because Vercel serverless functions don't have filesystem access at runtime
    console.log('[PDF API] Step 4: Getting HTML template...');
    const htmlTemplate = PDF_TEMPLATE;
    console.log('[PDF API] Template loaded, length:', htmlTemplate.length);

    // Step 5: Generate PDF
    console.log('[PDF API] Step 5: Generating PDF with Puppeteer...');
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF({
        template: htmlTemplate,
        data: pdfData,
      });
      console.log('[PDF API] PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    } catch (pdfError) {
      console.error('[PDF API] Error generating PDF:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    }

    // Step 6: Return PDF as binary
    console.log('[PDF API] Step 6: Returning PDF response...');
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="questionnaire-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF API] Fatal error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
