'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { QuestionnaireFormInput } from '@/lib/schemas/questionnaire';
import { valuesToLabels } from '@/lib/templates/value-to-label';

interface ConfirmDisplayProps {
  questionsJson: any;
  clinicId: string;
  locale: string;
}

export function ConfirmDisplay({ questionsJson, clinicId, locale }: ConfirmDisplayProps) {
  const router = useRouter();
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
      const response = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: clinicId,
          language: locale,
        }),
      });

      if (response.ok) {
        sessionStorage.removeItem('questionnaireData');
        router.push(`/clinic/${clinicId}/${locale}/complete`);
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('保存に失敗しました');
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-center mb-8">確認</h1>
        <p className="text-center mb-8 text-gray-600">以下の内容をご確認ください</p>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <div className="space-y-2">
              <p><strong>氏名:</strong> {formData.name}</p>
              <p><strong>性別:</strong> {formData.sex === 'male' ? '男' : '女'}</p>
              {formData.birth_year && formData.birth_month && formData.birth_day && (
                <p><strong>生年月日:</strong> {formData.birth_year}年{formData.birth_month}月{formData.birth_day}日</p>
              )}
              {formData.phone && <p><strong>電話番号:</strong> {formData.phone}</p>}
              {formData.address && <p><strong>住所:</strong> {formData.address}</p>}
              {formData.has_insurance !== null && (
                <p><strong>健康保険証:</strong> {formData.has_insurance ? 'あり' : 'なし'}</p>
              )}
              {formData.nationality && <p><strong>国籍:</strong> {formData.nationality}</p>}
            </div>
          </div>

          {symptomLabels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">症状</h2>
              <ul className="list-disc list-inside">
                {symptomLabels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
              </ul>
              {formData.symptom_other && <p className="mt-2">{formData.symptom_other}</p>}
            </div>
          )}

          {formData.has_allergy !== null && (
            <div>
              <h2 className="text-xl font-semibold mb-4">アレルギー</h2>
              <p><strong>アレルギー:</strong> {formData.has_allergy ? 'あり' : 'なし'}</p>
              {allergyTypeLabels.length > 0 && (
                <ul className="list-disc list-inside mt-2">
                  {allergyTypeLabels.map((label, index) => (
                    <li key={index}>{label}</li>
                  ))}
                </ul>
              )}
              {formData.allergy_other && <p className="mt-2">{formData.allergy_other}</p>}
            </div>
          )}

          {formData.is_medicating !== null && (
            <div>
              <h2 className="text-xl font-semibold mb-4">服薬</h2>
              <p><strong>服薬中:</strong> {formData.is_medicating ? 'あり' : 'なし'}</p>
              {formData.medication_detail && <p className="mt-2">{formData.medication_detail}</p>}
            </div>
          )}

          {pastDiseaseLabels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">既往歴</h2>
              <ul className="list-disc list-inside">
                {pastDiseaseLabels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
              </ul>
              {formData.disease_other && <p className="mt-2">{formData.disease_other}</p>}
            </div>
          )}

          {treatmentPreferenceLabels.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">治療希望</h2>
              <ul className="list-disc list-inside">
                {treatmentPreferenceLabels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
              </ul>
              {formData.treatment_other && <p className="mt-2">{formData.treatment_other}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleEdit}
            className="bg-gray-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-600 touch-manipulation min-h-[60px] min-w-[200px]"
          >
            編集
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 touch-manipulation min-h-[60px] min-w-[200px]"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
