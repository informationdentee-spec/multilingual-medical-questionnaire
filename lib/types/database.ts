export interface FormTemplate {
  id: string;
  template_name: string;
  questions_json: any;
  pdf_html: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  password_hash: string;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PasswordResetToken {
  id: string;
  tenant_id: string;
  token_hash: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Questionnaire {
  id: string;
  tenant_id: string;
  template_id: string | null;
  pdf_url: string | null;
  pdf_generating: boolean;
  language: string;
  name: string | null;
  sex: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  phone: string | null;
  address: string | null;
  has_insurance: boolean | null;
  nationality: string | null;
  symptoms: any;
  symptom_other: string | null;
  has_allergy: boolean | null;
  allergy_types: any;
  allergy_other: string | null;
  is_medicating: boolean | null;
  medication_detail: string | null;
  anesthesia_trouble: boolean | null;
  has_extraction: boolean | null;
  is_pregnant: boolean | null;
  pregnancy_months: number | null;
  is_lactating: boolean | null;
  past_diseases: any;
  disease_other: string | null;
  has_under_treatment: boolean | null;
  disease_under_treatment_detail: string | null;
  treatment_preferences: any;
  treatment_other: string | null;
  can_bring_interpreter: boolean | null;
  visit_year: number | null;
  visit_month: number | null;
  visit_day: number | null;
  created_at: string;
  updated_at: string;
}
