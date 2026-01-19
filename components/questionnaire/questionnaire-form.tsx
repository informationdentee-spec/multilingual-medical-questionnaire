'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionnaireSchema, QuestionnaireFormInput } from '@/lib/schemas/questionnaire';
import { useState, useEffect } from 'react';

interface QuestionnaireFormProps {
  slug: string;
  locale: string;
  questionsJson: any;
}

export function QuestionnaireForm({ slug, locale, questionsJson }: QuestionnaireFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuestionnaireFormInput>({
    resolver: zodResolver(questionnaireSchema) as any,
    defaultValues: {
      symptoms: [],
      allergy_types: [],
      past_diseases: [],
      treatment_preferences: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLabel = (field: any, key: string = 'label') => {
    if (!field || !field[key]) return '';
    if (typeof field[key] === 'string') return field[key];
    return field[key][locale] || field[key]['ja'] || '';
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Convert string values to proper types
      const processedData: QuestionnaireFormInput = {
        ...data,
        // Convert boolean fields from string to boolean
        has_insurance: data.has_insurance === 'true' ? true : data.has_insurance === 'false' ? false : null,
        has_allergy: data.has_allergy === 'true' ? true : data.has_allergy === 'false' ? false : null,
        is_medicating: data.is_medicating === 'true' ? true : data.is_medicating === 'false' ? false : null,
        has_under_treatment: data.has_under_treatment === 'true' ? true : data.has_under_treatment === 'false' ? false : null,
        // Convert number fields from string to number
        birth_year: data.birth_year ? parseInt(data.birth_year, 10) || null : null,
        birth_month: data.birth_month ? parseInt(data.birth_month, 10) || null : null,
        birth_day: data.birth_day ? parseInt(data.birth_day, 10) || null : null,
        pregnancy_months: data.pregnancy_months ? parseInt(data.pregnancy_months, 10) || null : null,
        visit_year: data.visit_year ? parseInt(data.visit_year, 10) || null : null,
        visit_month: data.visit_month ? parseInt(data.visit_month, 10) || null : null,
        visit_day: data.visit_day ? parseInt(data.visit_day, 10) || null : null,
        // Ensure arrays are arrays
        symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
        allergy_types: Array.isArray(data.allergy_types) ? data.allergy_types : [],
        past_diseases: Array.isArray(data.past_diseases) ? data.past_diseases : [],
        treatment_preferences: Array.isArray(data.treatment_preferences) ? data.treatment_preferences : [],
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('questionnaireData', JSON.stringify(processedData));
        window.location.href = `/clinic/${slug}/${locale}/confirm`;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  const toggleArrayValue = (fieldName: keyof QuestionnaireFormInput, value: string) => {
    const current = watch(fieldName) as string[];
    if (Array.isArray(current)) {
      if (current.includes(value)) {
        setValue(fieldName, current.filter((v) => v !== value) as any);
      } else {
        setValue(fieldName, [...current, value] as any);
      }
    }
  };

  if (!questionsJson || !questionsJson.sections) {
    return <div>テンプレートを読み込めませんでした</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4 max-w-2xl mx-auto">
      {questionsJson.sections.map((section: any) => (
        <div key={section.id} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">{getLabel(section, 'title')}</h2>
          
          <div className="space-y-6">
            {section.fields?.map((field: any) => {
              const fieldId = field.id;
              const label = getLabel(field);
              const placeholder = getLabel(field, 'placeholder');

              switch (field.type) {
                case 'text':
                  return (
                    <div key={fieldId}>
                      <label className="block text-lg font-medium mb-2">
                        {label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        {...register(fieldId as keyof QuestionnaireFormInput)}
                        placeholder={placeholder}
                        className="w-full p-3 border border-gray-300 rounded-lg text-lg touch-manipulation"
                      />
                      {errors[fieldId as keyof QuestionnaireFormInput] && (
                        <p className="text-red-500 mt-1">
                          {errors[fieldId as keyof QuestionnaireFormInput]?.message as string}
                        </p>
                      )}
                    </div>
                  );

                case 'radio':
                  return (
                    <div key={fieldId}>
                      <label className="block text-lg font-medium mb-3">
                        {label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="space-y-2">
                        {field.options?.map((option: any) => (
                          <label
                            key={option.value}
                            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation"
                          >
                            <input
                              type="radio"
                              value={option.value}
                              {...register(fieldId as keyof QuestionnaireFormInput)}
                              className="w-5 h-5 mr-3"
                            />
                            <span className="text-lg">{getLabel(option)}</span>
                          </label>
                        ))}
                      </div>
                      {errors[fieldId as keyof QuestionnaireFormInput] && (
                        <p className="text-red-500 mt-1">
                          {errors[fieldId as keyof QuestionnaireFormInput]?.message as string}
                        </p>
                      )}
                    </div>
                  );

                case 'checkbox-group':
                  return (
                    <div key={fieldId}>
                      <label className="block text-lg font-medium mb-3">
                        {label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="space-y-2">
                        {field.options?.map((option: any) => {
                          const current = watch(fieldId as keyof QuestionnaireFormInput) as string[];
                          const isChecked = Array.isArray(current) && current.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 touch-manipulation"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleArrayValue(fieldId as keyof QuestionnaireFormInput, option.value)}
                                className="w-5 h-5 mr-3"
                              />
                              <span className="text-lg">{getLabel(option)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );

                case 'textarea':
                  return (
                    <div key={fieldId}>
                      <label className="block text-lg font-medium mb-2">
                        {label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        {...register(fieldId as keyof QuestionnaireFormInput)}
                        placeholder={placeholder}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg text-lg touch-manipulation"
                      />
                      {errors[fieldId as keyof QuestionnaireFormInput] && (
                        <p className="text-red-500 mt-1">
                          {errors[fieldId as keyof QuestionnaireFormInput]?.message as string}
                        </p>
                      )}
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-center gap-4 pb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 touch-manipulation min-h-[60px] min-w-[200px]"
        >
          {isSubmitting ? '送信中...' : '確認'}
        </button>
      </div>
    </form>
  );
}
