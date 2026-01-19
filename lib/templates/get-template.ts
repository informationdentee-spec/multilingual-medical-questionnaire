import { supabaseAdmin } from '@/lib/supabase/server';

// Complete test template with all questionnaire fields
export function getCompleteTestTemplate() {
  return {
    sections: [
      {
        id: 'basic',
        title: { ja: '基本情報', en: 'Basic Information' },
        fields: [
          {
            id: 'name',
            type: 'text',
            label: { ja: '氏名', en: 'Name' },
            required: true,
            placeholder: { ja: '名前を入力', en: 'Enter your name' },
          },
          {
            id: 'sex',
            type: 'radio',
            label: { ja: '性別', en: 'Gender' },
            required: true,
            options: [
              { value: 'male', label: { ja: '男', en: 'Male' } },
              { value: 'female', label: { ja: '女', en: 'Female' } },
            ],
          },
          {
            id: 'birth_year',
            type: 'text',
            label: { ja: '生年', en: 'Birth Year' },
            required: false,
            placeholder: { ja: '例: 1990', en: 'e.g. 1990' },
          },
          {
            id: 'birth_month',
            type: 'text',
            label: { ja: '生月', en: 'Birth Month' },
            required: false,
            placeholder: { ja: '例: 1', en: 'e.g. 1' },
          },
          {
            id: 'birth_day',
            type: 'text',
            label: { ja: '生日', en: 'Birth Day' },
            required: false,
            placeholder: { ja: '例: 15', en: 'e.g. 15' },
          },
          {
            id: 'phone',
            type: 'text',
            label: { ja: '電話番号', en: 'Phone' },
            required: false,
            placeholder: { ja: '電話番号を入力', en: 'Enter your phone number' },
          },
          {
            id: 'address',
            type: 'textarea',
            label: { ja: '住所', en: 'Address' },
            required: false,
            placeholder: { ja: '住所を入力', en: 'Enter your address' },
          },
          {
            id: 'has_insurance',
            type: 'radio',
            label: { ja: '健康保険証', en: 'Health Insurance' },
            required: false,
            options: [
              { value: 'true', label: { ja: 'あり', en: 'Yes' } },
              { value: 'false', label: { ja: 'なし', en: 'No' } },
            ],
          },
          {
            id: 'nationality',
            type: 'text',
            label: { ja: '国籍', en: 'Nationality' },
            required: false,
            placeholder: { ja: '国籍を入力', en: 'Enter your nationality' },
          },
        ],
      },
      {
        id: 'symptoms',
        title: { ja: '症状', en: 'Symptoms' },
        fields: [
          {
            id: 'symptoms',
            type: 'checkbox-group',
            label: { ja: '症状', en: 'Symptoms' },
            required: false,
            options: [
              { value: 'toothache', label: { ja: '歯痛', en: 'Toothache' } },
              { value: 'bleeding', label: { ja: '出血', en: 'Bleeding' } },
              { value: 'swelling', label: { ja: '腫れ', en: 'Swelling' } },
              { value: 'other', label: { ja: 'その他', en: 'Other' } },
            ],
          },
          {
            id: 'symptom_other',
            type: 'textarea',
            label: { ja: 'その他の症状', en: 'Other Symptoms' },
            required: false,
            placeholder: { ja: 'その他の症状を入力', en: 'Enter other symptoms' },
          },
        ],
      },
      {
        id: 'allergy',
        title: { ja: 'アレルギー', en: 'Allergies' },
        fields: [
          {
            id: 'has_allergy',
            type: 'radio',
            label: { ja: 'アレルギー', en: 'Allergies' },
            required: false,
            options: [
              { value: 'true', label: { ja: 'あり', en: 'Yes' } },
              { value: 'false', label: { ja: 'なし', en: 'No' } },
            ],
          },
          {
            id: 'allergy_types',
            type: 'checkbox-group',
            label: { ja: 'アレルギーの種類', en: 'Types of Allergies' },
            required: false,
            options: [
              { value: 'medicine', label: { ja: '薬', en: 'Medicine' } },
              { value: 'food', label: { ja: '食物', en: 'Food' } },
              { value: 'other', label: { ja: 'その他', en: 'Other' } },
            ],
          },
          {
            id: 'allergy_other',
            type: 'textarea',
            label: { ja: 'その他のアレルギー', en: 'Other Allergies' },
            required: false,
            placeholder: { ja: 'その他のアレルギーを入力', en: 'Enter other allergies' },
          },
        ],
      },
      {
        id: 'medication',
        title: { ja: '服薬', en: 'Medication' },
        fields: [
          {
            id: 'is_medicating',
            type: 'radio',
            label: { ja: '服薬中', en: 'Currently Taking Medication' },
            required: false,
            options: [
              { value: 'true', label: { ja: 'あり', en: 'Yes' } },
              { value: 'false', label: { ja: 'なし', en: 'No' } },
            ],
          },
          {
            id: 'medication_detail',
            type: 'textarea',
            label: { ja: '服薬内容', en: 'Medication Details' },
            required: false,
            placeholder: { ja: '服薬内容を入力', en: 'Enter medication details' },
          },
        ],
      },
      {
        id: 'medical_history',
        title: { ja: '既往歴', en: 'Medical History' },
        fields: [
          {
            id: 'past_diseases',
            type: 'checkbox-group',
            label: { ja: '既往歴', en: 'Past Diseases' },
            required: false,
            options: [
              { value: 'diabetes', label: { ja: '糖尿病', en: 'Diabetes' } },
              { value: 'hypertension', label: { ja: '高血圧', en: 'Hypertension' } },
              { value: 'heart_disease', label: { ja: '心臓病', en: 'Heart Disease' } },
              { value: 'other', label: { ja: 'その他', en: 'Other' } },
            ],
          },
          {
            id: 'disease_other',
            type: 'textarea',
            label: { ja: 'その他の既往歴', en: 'Other Past Diseases' },
            required: false,
            placeholder: { ja: 'その他の既往歴を入力', en: 'Enter other past diseases' },
          },
          {
            id: 'has_under_treatment',
            type: 'radio',
            label: { ja: '治療中', en: 'Currently Under Treatment' },
            required: false,
            options: [
              { value: 'true', label: { ja: 'あり', en: 'Yes' } },
              { value: 'false', label: { ja: 'なし', en: 'No' } },
            ],
          },
          {
            id: 'disease_under_treatment_detail',
            type: 'textarea',
            label: { ja: '治療内容', en: 'Treatment Details' },
            required: false,
            placeholder: { ja: '治療内容を入力', en: 'Enter treatment details' },
          },
        ],
      },
      {
        id: 'treatment_preferences',
        title: { ja: '治療希望', en: 'Treatment Preferences' },
        fields: [
          {
            id: 'treatment_preferences',
            type: 'checkbox-group',
            label: { ja: '治療希望', en: 'Treatment Preferences' },
            required: false,
            options: [
              { value: 'cleaning', label: { ja: 'クリーニング', en: 'Cleaning' } },
              { value: 'filling', label: { ja: '詰め物', en: 'Filling' } },
              { value: 'extraction', label: { ja: '抜歯', en: 'Extraction' } },
              { value: 'other', label: { ja: 'その他', en: 'Other' } },
            ],
          },
          {
            id: 'treatment_other',
            type: 'textarea',
            label: { ja: 'その他の治療希望', en: 'Other Treatment Preferences' },
            required: false,
            placeholder: { ja: 'その他の治療希望を入力', en: 'Enter other treatment preferences' },
          },
        ],
      },
    ],
  };
}

export async function getTemplate(clinicId: string) {
  // Test mode: If clinicId is "test", return complete test template
  if (clinicId === 'test') {
    return getCompleteTestTemplate();
  }

  // Production mode: Get tenant (clinicId is used as slug in database)
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select('id, template_id')
    .eq('slug', clinicId)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  // Get template
  const { data: template, error: templateError } = await supabaseAdmin
    .from('form_templates')
    .select('questions_json')
    .eq('id', tenant.template_id)
    .single();

  if (templateError || !template) {
    return null;
  }

  return template.questions_json;
}
