'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { QuestionnaireFormInput } from '@/lib/schemas/questionnaire';
import { valuesToLabels } from '@/lib/templates/value-to-label';

interface ConfirmDisplayProps {
  questionsJson: any;
  clinicId: string;
  locale: string;
}

export function ConfirmDisplay({ questionsJson, clinicId, locale }: ConfirmDisplayProps) {
  const router = useRouter();
  const t = useTranslations('confirm');
  const [formData, setFormData] = useState<QuestionnaireFormInput | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('questionnaireData');
      if (data) {
        setFormData(JSON.parse(data));
      } else {
        router.push(`/clinic/${clinicId}/${locale}/questionnaire`);
      }
    }
  }, [router, clinicId, locale]);

  const handleEdit = () => {
    router.push(`/clinic/${clinicId}/${locale}/questionnaire`);
  };

  const handleSubmit = async () => {
    if (!formData) return;

    try {
      // Log the data being sent
      console.log('Submitting form data:', {
        clinicId,
        locale,
        formData,
      });

      const response = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: clinicId,
          language: locale,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        sessionStorage.removeItem('questionnaireData');
        router.push(`/clinic/${clinicId}/${locale}/complete`);
      } else {
        // Display detailed error message
        const errorMessage = responseData.details 
          ? `${t('saveError')}: ${responseData.details}`
          : responseData.error 
          ? `${t('saveError')}: ${responseData.error}`
          : t('saveError');
        console.error('Save error:', responseData);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error 
        ? `${t('saveError')}: ${error.message}`
        : t('saveError');
      alert(errorMessage);
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('loading')}</p>
      </div>
    );
  }
  
  // Format date helper
  const formatDate = (year: number | null, month: number | null, day: number | null) => {
    if (!year || !month || !day) return '';
    return `${year}${locale === 'ja' ? '年' : '/'}${month}${locale === 'ja' ? '月' : '/'}${day}${locale === 'ja' ? '日' : ''}`;
  };
  
  // Format sex
  const formatSex = (sex: string | null) => {
    if (sex === 'male') return t('male');
    if (sex === 'female') return t('female');
    return '';
  };
  
  // Format yes/no
  const formatYesNo = (value: boolean | null) => {
    if (value === true) return t('yes');
    if (value === false) return t('no');
    return '';
  };

  // Convert values to labels for display
  const symptomLabels = formData.symptoms && formData.symptoms.length > 0
    ? valuesToLabels(formData.symptoms, 'symptoms', questionsJson, locale)
    : [];
  
  const allergyTypeLabels = formData.allergy_types && formData.allergy_types.length > 0
    ? valuesToLabels(formData.allergy_types, 'allergy_types', questionsJson, locale)
    : [];
  
  const pastDiseaseLabels = formData.past_diseases && formData.past_diseases.length > 0
    ? valuesToLabels(formData.past_diseases, 'past_diseases', questionsJson, locale)
    : [];
  
  const treatmentPreferenceLabels = formData.treatment_preferences && formData.treatment_preferences.length > 0
    ? valuesToLabels(formData.treatment_preferences, 'treatment_preferences', questionsJson, locale)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
        <p className="text-center mb-8 text-gray-600">{t('reviewMessage')}</p>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('basicInfo')}</h2>
            <div className="space-y-2">
              <p><strong>{t('name')}:</strong> {formData.name}</p>
              <p><strong>{t('sex')}:</strong> {formatSex(formData.sex)}</p>
              {formData.birth_year && formData.birth_month && formData.birth_day && (
                <p><strong>{t('birthDate')}:</strong> {formatDate(formData.birth_year, formData.birth_month, formData.birth_day)}</p>
              )}
              {formData.phone && <p><strong>{t('phone')}:</strong> {formData.phone}</p>}
              {formData.address && <p><strong>{t('address')}:</strong> {formData.address}</p>}
              {formData.has_insurance !== null && (
                <p><strong>{t('insurance')}:</strong> {formatYesNo(formData.has_insurance)}</p>
              )}
              {formData.nationality && <p><strong>{t('nationality')}:</strong> {formData.nationality}</p>}
            </div>
          </div>

          {symptomLabels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('symptoms')}</h2>
              <ul className="list-disc list-inside">
                {symptomLabels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
              </ul>
              {formData.symptom_other && <p className="mt-2"><strong>{t('other')}:</strong> {formData.symptom_other}</p>}
            </div>
          )}

          {formData.has_allergy !== null && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('allergy')}</h2>
              <p><strong>{t('allergy')}:</strong> {formatYesNo(formData.has_allergy)}</p>
              {allergyTypeLabels.length > 0 && (
                <ul className="list-disc list-inside mt-2">
                  {allergyTypeLabels.map((label, index) => (
                    <li key={index}>{label}</li>
                  ))}
                </ul>
              )}
              {formData.allergy_other && <p className="mt-2"><strong>{t('other')}:</strong> {formData.allergy_other}</p>}
            </div>
          )}

          {formData.is_medicating !== null && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('medication')}</h2>
              <p><strong>{t('medicating')}:</strong> {formatYesNo(formData.is_medicating)}</p>
              {formData.medication_detail && <p className="mt-2"><strong>{t('medicationDetail')}:</strong> {formData.medication_detail}</p>}
            </div>
          )}

          {pastDiseaseLabels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('medicalHistory')}</h2>
              <ul className="list-disc list-inside">
                {pastDiseaseLabels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
              </ul>
              {formData.disease_other && <p className="mt-2"><strong>{t('other')}:</strong> {formData.disease_other}</p>}
            </div>
          )}

          {treatmentPreferenceLabels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('treatmentPreferences')}</h2>
              <ul className="list-disc list-inside">
                {treatmentPreferenceLabels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
              </ul>
              {formData.treatment_other && <p className="mt-2"><strong>{t('other')}:</strong> {formData.treatment_other}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleEdit}
            className="bg-gray-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-600 touch-manipulation min-h-[60px] min-w-[200px]"
          >
            {t('edit')}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 touch-manipulation min-h-[60px] min-w-[200px]"
          >
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
