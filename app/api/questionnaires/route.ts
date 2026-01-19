import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, language, ...formData } = body;

    // Log the received data for debugging
    console.log('Received data:', JSON.stringify({ slug, language, formData }, null, 2));

    // Validate required fields
    if (!slug) {
      return NextResponse.json(
        { error: 'slug is required', details: 'clinicId is missing' },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'language is required', details: 'locale is missing' },
        { status: 400 }
      );
    }

    // Get current date for visit date
    const now = new Date();
    const visitYear = formData.visit_year || now.getFullYear();
    const visitMonth = formData.visit_month || now.getMonth() + 1;
    const visitDay = formData.visit_day || now.getDate();

    // Prepare data for insertion with proper type conversion
    const insertData: any = {
      tenant_id: null, // Not used in current architecture
      template_id: null, // Not used in current architecture
      language: language,
      pdf_generating: true,
      // Basic information
      name: formData.name || null,
      sex: formData.sex || null, // 'male' or 'female'
      birth_year: formData.birth_year !== null && formData.birth_year !== undefined ? Number(formData.birth_year) : null,
      birth_month: formData.birth_month !== null && formData.birth_month !== undefined ? Number(formData.birth_month) : null,
      birth_day: formData.birth_day !== null && formData.birth_day !== undefined ? Number(formData.birth_day) : null,
      phone: formData.phone || null,
      address: formData.address || null,
      has_insurance: formData.has_insurance !== null && formData.has_insurance !== undefined ? Boolean(formData.has_insurance) : null,
      nationality: formData.nationality || null,
      // Symptoms
      symptoms: Array.isArray(formData.symptoms) ? formData.symptoms : (formData.symptoms ? [formData.symptoms] : []),
      symptom_other: formData.symptom_other || null,
      // Allergies
      has_allergy: formData.has_allergy !== null && formData.has_allergy !== undefined ? Boolean(formData.has_allergy) : null,
      allergy_types: Array.isArray(formData.allergy_types) ? formData.allergy_types : (formData.allergy_types ? [formData.allergy_types] : []),
      allergy_other: formData.allergy_other || null,
      // Medication
      is_medicating: formData.is_medicating !== null && formData.is_medicating !== undefined ? Boolean(formData.is_medicating) : null,
      medication_detail: formData.medication_detail || null,
      // Anesthesia, extraction, pregnancy, lactation
      anesthesia_trouble: formData.anesthesia_trouble !== null && formData.anesthesia_trouble !== undefined ? Boolean(formData.anesthesia_trouble) : null,
      has_extraction: formData.has_extraction !== null && formData.has_extraction !== undefined ? Boolean(formData.has_extraction) : null,
      is_pregnant: formData.is_pregnant !== null && formData.is_pregnant !== undefined ? Boolean(formData.is_pregnant) : null,
      pregnancy_months: formData.pregnancy_months !== null && formData.pregnancy_months !== undefined ? Number(formData.pregnancy_months) : null,
      is_lactating: formData.is_lactating !== null && formData.is_lactating !== undefined ? Boolean(formData.is_lactating) : null,
      // Medical history
      past_diseases: Array.isArray(formData.past_diseases) ? formData.past_diseases : (formData.past_diseases ? [formData.past_diseases] : []),
      disease_other: formData.disease_other || null,
      has_under_treatment: formData.has_under_treatment !== null && formData.has_under_treatment !== undefined ? Boolean(formData.has_under_treatment) : null,
      disease_under_treatment_detail: formData.disease_under_treatment_detail || null,
      // Treatment preferences
      treatment_preferences: Array.isArray(formData.treatment_preferences) ? formData.treatment_preferences : (formData.treatment_preferences ? [formData.treatment_preferences] : []),
      treatment_other: formData.treatment_other || null,
      // Interpreter
      can_bring_interpreter: formData.can_bring_interpreter !== null && formData.can_bring_interpreter !== undefined ? Boolean(formData.can_bring_interpreter) : null,
      // Visit date
      visit_year: Number(visitYear),
      visit_month: Number(visitMonth),
      visit_day: Number(visitDay),
    };

    // Log the prepared data for debugging
    console.log('Prepared insert data:', JSON.stringify(insertData, null, 2));

    // Insert questionnaire
    const { data: questionnaire, error: insertError } = await supabaseAdmin
      .from('questionnaires')
      .insert(insertData)
      .select()
      .single();

    if (insertError || !questionnaire) {
      console.error('Error inserting questionnaire:', insertError);
      console.error('Insert data that failed:', JSON.stringify(insertData, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to save questionnaire',
          details: insertError?.message || 'Unknown error',
          code: insertError?.code || 'UNKNOWN',
          hint: insertError?.hint || null,
        },
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
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
