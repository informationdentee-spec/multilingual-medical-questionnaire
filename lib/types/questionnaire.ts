export interface QuestionnaireFormData {
  // 基本情報
  name: string;
  sex: 'male' | 'female' | '';
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  phone: string;
  address: string;
  has_insurance: boolean | null;
  nationality: string;
  // 症状
  symptoms: string[];
  symptom_other: string;
  // アレルギー
  has_allergy: boolean | null;
  allergy_types: string[];
  allergy_other: string;
  // 服薬
  is_medicating: boolean | null;
  medication_detail: string;
  // 麻酔・抜歯・妊娠・授乳
  anesthesia_trouble: boolean | null;
  has_extraction: boolean | null;
  is_pregnant: boolean | null;
  pregnancy_months: number | null;
  is_lactating: boolean | null;
  // 既往歴
  past_diseases: string[];
  disease_other: string;
  has_under_treatment: boolean | null;
  disease_under_treatment_detail: string;
  // 治療希望
  treatment_preferences: string[];
  treatment_other: string;
  // 通訳
  can_bring_interpreter: boolean | null;
  // メタデータ
  visit_year: number | null;
  visit_month: number | null;
  visit_day: number | null;
}
