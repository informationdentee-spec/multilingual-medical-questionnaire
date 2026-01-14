import { z } from 'zod';

export const questionnaireSchema = z.object({
  name: z.string().min(1, '必須項目です'),
  sex: z.enum(['male', 'female'], {
    required_error: '必須項目です',
  }),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()).nullable(),
  birth_month: z.number().int().min(1).max(12).nullable(),
  birth_day: z.number().int().min(1).max(31).nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  has_insurance: z.boolean().nullable(),
  nationality: z.string().optional(),
  symptoms: z.array(z.string()).default([]),
  symptom_other: z.string().optional(),
  has_allergy: z.boolean().nullable(),
  allergy_types: z.array(z.string()).default([]),
  allergy_other: z.string().optional(),
  is_medicating: z.boolean().nullable(),
  medication_detail: z.string().optional(),
  anesthesia_trouble: z.boolean().nullable(),
  has_extraction: z.boolean().nullable(),
  is_pregnant: z.boolean().nullable(),
  pregnancy_months: z.number().int().min(1).max(10).nullable(),
  is_lactating: z.boolean().nullable(),
  past_diseases: z.array(z.string()).default([]),
  disease_other: z.string().optional(),
  has_under_treatment: z.boolean().nullable(),
  disease_under_treatment_detail: z.string().optional(),
  treatment_preferences: z.array(z.string()).default([]),
  treatment_other: z.string().optional(),
  can_bring_interpreter: z.boolean().nullable(),
  visit_year: z.number().int().min(2000).max(new Date().getFullYear() + 1).nullable(),
  visit_month: z.number().int().min(1).max(12).nullable(),
  visit_day: z.number().int().min(1).max(31).nullable(),
});

export type QuestionnaireFormInput = z.infer<typeof questionnaireSchema>;
