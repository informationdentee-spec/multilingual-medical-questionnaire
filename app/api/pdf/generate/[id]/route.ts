import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generatePDF } from '@/lib/pdf/generator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify internal API token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INTERNAL_API_TOKEN;
    
    if (!authHeader || !expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get questionnaire
    const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select('*, template_id')
      .eq('id', params.id)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    // Get template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('form_templates')
      .select('pdf_html')
      .eq('id', questionnaire.template_id)
      .single();

    if (templateError || !template) {
      // Update pdf_generating to false
      await supabaseAdmin
        .from('questionnaires')
        .update({ pdf_generating: false })
        .eq('id', params.id);
      
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Prepare data for PDF
    const pdfData = {
      name: questionnaire.name || '',
      sex: questionnaire.sex === 'male' ? '男' : questionnaire.sex === 'female' ? '女' : '',
      birth_year: questionnaire.birth_year || '',
      birth_month: questionnaire.birth_month || '',
      birth_day: questionnaire.birth_day || '',
      phone: questionnaire.phone || '',
      address: questionnaire.address || '',
      has_insurance: questionnaire.has_insurance ? 'あり' : 'なし',
      nationality: questionnaire.nationality || '',
      symptoms: Array.isArray(questionnaire.symptoms) ? questionnaire.symptoms : [],
      symptom_other: questionnaire.symptom_other || '',
      has_allergy: questionnaire.has_allergy ? 'あり' : 'なし',
      allergy_types: Array.isArray(questionnaire.allergy_types) ? questionnaire.allergy_types : [],
      allergy_other: questionnaire.allergy_other || '',
      is_medicating: questionnaire.is_medicating ? 'あり' : 'なし',
      medication_detail: questionnaire.medication_detail || '',
      anesthesia_trouble: questionnaire.anesthesia_trouble ? 'あり' : 'なし',
      has_extraction: questionnaire.has_extraction ? 'あり' : 'なし',
      is_pregnant: questionnaire.is_pregnant ? 'あり' : 'なし',
      pregnancy_months: questionnaire.pregnancy_months || '',
      is_lactating: questionnaire.is_lactating ? 'あり' : 'なし',
      past_diseases: Array.isArray(questionnaire.past_diseases) ? questionnaire.past_diseases : [],
      disease_other: questionnaire.disease_other || '',
      has_under_treatment: questionnaire.has_under_treatment ? 'あり' : 'なし',
      disease_under_treatment_detail: questionnaire.disease_under_treatment_detail || '',
      treatment_preferences: Array.isArray(questionnaire.treatment_preferences) ? questionnaire.treatment_preferences : [],
      treatment_other: questionnaire.treatment_other || '',
      can_bring_interpreter: questionnaire.can_bring_interpreter ? 'はい' : 'いいえ',
      visit_year: questionnaire.visit_year || new Date().getFullYear(),
      visit_month: questionnaire.visit_month || new Date().getMonth() + 1,
      visit_day: questionnaire.visit_day || new Date().getDate(),
    };

    // Generate PDF
    const pdfBuffer = await generatePDF({
      template: template.pdf_html,
      data: pdfData,
    });

    // Upload to Supabase Storage
    const fileName = `questionnaires/${params.id}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      await supabaseAdmin
        .from('questionnaires')
        .update({ pdf_generating: false })
        .eq('id', params.id);
      
      return NextResponse.json(
        { error: 'Failed to upload PDF' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('pdfs')
      .getPublicUrl(fileName);

    // Update questionnaire with PDF URL
    const { error: updateError } = await supabaseAdmin
      .from('questionnaires')
      .update({
        pdf_url: urlData.publicUrl,
        pdf_generating: false,
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating questionnaire:', updateError);
      return NextResponse.json(
        { error: 'Failed to update questionnaire' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'PDF generated successfully',
      pdf_url: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Update pdf_generating to false on error
    await supabaseAdmin
      .from('questionnaires')
      .update({ pdf_generating: false })
      .eq('id', params.id)
      .catch(console.error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
