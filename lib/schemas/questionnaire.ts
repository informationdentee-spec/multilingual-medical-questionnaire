import { z } from 'zod';

// Helper function to convert string to number or null
const stringToNumber = (val: unknown): number | null => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

// Helper function to convert string to boolean or null
const stringToBoolean = (val: unknown): boolean | null => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val === 'true' || val === 'あり') return true;
    if (val === 'false' || val === 'なし') return false;
    return null;
  }
  return null;
};

// Helper function to ensure array
const ensureArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val;
  if (val === null || val === undefined || val === '') return [];
  return [];
};

export const questionnaireSchema = z.object({
  name: z.string().min(1, '必須項目です'),
  sex: z.enum(['male', 'female']).refine((v) => v !== undefined, { message: '必須項目です' }),
  birth_year: z.preprocess(stringToNumber, z.number().int().min(1900).max(new Date().getFullYear()).nullable()),
  birth_month: z.preprocess(stringToNumber, z.number().int().min(1).max(12).nullable()),
  birth_day: z.preprocess(stringToNumber, z.number().int().min(1).max(31).nullable()),
  phone: z.string().optional(),
  address: z.string().optional(),
  has_insurance: z.preprocess(stringToBoolean, z.boolean().nullable()),
  nationality: z.string().optional(),
  symptoms: z.preprocess(ensureArray, z.array(z.string())),
  symptom_other: z.string().optional(),
  has_allergy: z.preprocess(stringToBoolean, z.boolean().nullable()),
  allergy_types: z.preprocess(ensureArray, z.array(z.string())),
  allergy_other: z.string().optional(),
  is_medicating: z.preprocess(stringToBoolean, z.boolean().nullable()),
  medication_detail: z.string().optional(),
  anesthesia_trouble: z.preprocess(stringToBoolean, z.boolean().nullable()),
  has_extraction: z.preprocess(stringToBoolean, z.boolean().nullable()),
  is_pregnant: z.preprocess(stringToBoolean, z.boolean().nullable()),
  pregnancy_months: z.preprocess(stringToNumber, z.number().int().min(1).max(10).nullable()),
  is_lactating: z.preprocess(stringToBoolean, z.boolean().nullable()),
  past_diseases: z.preprocess(ensureArray, z.array(z.string())),
  disease_other: z.string().optional(),
  has_under_treatment: z.preprocess(stringToBoolean, z.boolean().nullable()),
  disease_under_treatment_detail: z.string().optional(),
  treatment_preferences: z.preprocess(ensureArray, z.array(z.string())),
  treatment_other: z.string().optional(),
  can_bring_interpreter: z.preprocess(stringToBoolean, z.boolean().nullable()),
  visit_year: z.preprocess(stringToNumber, z.number().int().min(2000).max(new Date().getFullYear() + 1).nullable()),
  visit_month: z.preprocess(stringToNumber, z.number().int().min(1).max(12).nullable()),
  visit_day: z.preprocess(stringToNumber, z.number().int().min(1).max(31).nullable()),
});

export type QuestionnaireFormInput = {
  name: string;
  sex: 'male' | 'female';
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  phone?: string;
  address?: string;
  has_insurance: boolean | null;
  nationality?: string;
  symptoms: string[];
  symptom_other?: string;
  has_allergy: boolean | null;
  allergy_types: string[];
  allergy_other?: string;
  is_medicating: boolean | null;
  medication_detail?: string;
  anesthesia_trouble: boolean | null;
  has_extraction: boolean | null;
  is_pregnant: boolean | null;
  pregnancy_months: number | null;
  is_lactating: boolean | null;
  past_diseases: string[];
  disease_other?: string;
  has_under_treatment: boolean | null;
  disease_under_treatment_detail?: string;
  treatment_preferences: string[];
  treatment_other?: string;
  can_bring_interpreter: boolean | null;
  visit_year: number | null;
  visit_month: number | null;
  visit_day: number | null;
};
