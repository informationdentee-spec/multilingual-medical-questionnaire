'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface QuestionnaireData {
  name: string | null;
  sex: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  phone: string | null;
  address: string | null;
  has_insurance: boolean | null;
  nationality: string | null;
  symptoms: string[];
  symptom_other: string | null;
  has_allergy: boolean | null;
  allergy_types: string[];
  allergy_other: string | null;
  is_medicating: boolean | null;
  medication_detail: string | null;
  anesthesia_trouble: boolean | null;
  has_extraction: boolean | null;
  is_pregnant: boolean | null;
  pregnancy_months: number | null;
  is_lactating: boolean | null;
  past_diseases: string[];
  disease_other: string | null;
  has_under_treatment: boolean | null;
  disease_under_treatment_detail: string | null;
  treatment_preferences: string[];
  treatment_other: string | null;
  can_bring_interpreter: boolean | null;
  visit_year: number | null;
  visit_month: number | null;
  visit_day: number | null;
}

interface QuestionnaireResponse {
  id: string;
  clinic_id: string;
  locale: string;
  data: QuestionnaireData;
  created_at: string;
}

export default function QuestionnaireDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printing, setPrinting] = useState(false);

  const checkAuth = async () => {
    try {
      const authResponse = await fetch('/api/auth/session');
      if (!authResponse.ok) {
        router.push('/admin/login');
        return;
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuestionnaire = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/questionnaire-responses/${id}`);
      const data = await response.json();

      if (response.ok) {
        setResponse(data);
      } else {
        setError(data.error || '問診票の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      setError('問診票の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestionnaire();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const printResponse = await fetch(`/api/print/${id}`, {
        method: 'POST',
      });

      const data = await printResponse.json();

      if (printResponse.ok) {
        alert('プリンターに送信しました');
      } else {
        alert(`印刷に失敗しました: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error printing:', error);
      alert('印刷に失敗しました');
    } finally {
      setPrinting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '問診票が見つかりませんでした'}</p>
          <Link
            href="/admin/questionnaires"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 touch-manipulation"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const data = response.data;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/questionnaires"
              className="text-blue-600 hover:text-blue-800 touch-manipulation"
            >
              ← 一覧に戻る
            </Link>
            <h1 className="text-3xl font-bold">問診票詳細</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              disabled={printing}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 touch-manipulation"
            >
              {printing ? '送信中...' : '印刷'}
            </button>
            <Link
              href={`/admin/preview/${id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 touch-manipulation"
            >
              PDF表示
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">氏名</p>
                <p className="font-medium">{data.name || '（未入力）'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">性別</p>
                <p className="font-medium">{data.sex === 'male' ? '男' : data.sex === 'female' ? '女' : '（未入力）'}</p>
              </div>
              {(data.birth_year || data.birth_month || data.birth_day) && (
                <div>
                  <p className="text-sm text-gray-500">生年月日</p>
                  <p className="font-medium">
                    {data.birth_year}年{data.birth_month}月{data.birth_day}日
                  </p>
                </div>
              )}
              {data.phone && (
                <div>
                  <p className="text-sm text-gray-500">電話番号</p>
                  <p className="font-medium">{data.phone}</p>
                </div>
              )}
              {data.address && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">住所</p>
                  <p className="font-medium">{data.address}</p>
                </div>
              )}
              {data.has_insurance !== null && (
                <div>
                  <p className="text-sm text-gray-500">健康保険証</p>
                  <p className="font-medium">{data.has_insurance ? 'あり' : 'なし'}</p>
                </div>
              )}
              {data.nationality && (
                <div>
                  <p className="text-sm text-gray-500">国籍</p>
                  <p className="font-medium">{data.nationality}</p>
                </div>
              )}
            </div>
          </div>

          {data.symptoms && data.symptoms.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">症状</h2>
              <ul className="list-disc list-inside">
                {data.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
              {data.symptom_other && <p className="mt-2">{data.symptom_other}</p>}
            </div>
          )}

          {data.has_allergy !== null && (
            <div>
              <h2 className="text-xl font-semibold mb-4">アレルギー</h2>
              <p className="mb-2">{data.has_allergy ? 'あり' : 'なし'}</p>
              {data.allergy_types && data.allergy_types.length > 0 && (
                <ul className="list-disc list-inside mb-2">
                  {data.allergy_types.map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              )}
              {data.allergy_other && <p>{data.allergy_other}</p>}
            </div>
          )}

          {data.is_medicating !== null && (
            <div>
              <h2 className="text-xl font-semibold mb-4">服薬</h2>
              <p className="mb-2">{data.is_medicating ? 'あり' : 'なし'}</p>
              {data.medication_detail && <p>{data.medication_detail}</p>}
            </div>
          )}

          {data.past_diseases && data.past_diseases.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">既往歴</h2>
              <ul className="list-disc list-inside">
                {data.past_diseases.map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))}
              </ul>
              {data.disease_other && <p className="mt-2">{data.disease_other}</p>}
              {data.has_under_treatment !== null && (
                <p className="mt-2">現在治療中: {data.has_under_treatment ? 'あり' : 'なし'}</p>
              )}
              {data.disease_under_treatment_detail && <p className="mt-2">{data.disease_under_treatment_detail}</p>}
            </div>
          )}

          {data.treatment_preferences && data.treatment_preferences.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">治療希望</h2>
              <ul className="list-disc list-inside">
                {data.treatment_preferences.map((pref, index) => (
                  <li key={index}>{pref}</li>
                ))}
              </ul>
              {data.treatment_other && <p className="mt-2">{data.treatment_other}</p>}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">メタデータ</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">作成日時</p>
                <p className="font-medium">{formatDate(response.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">言語</p>
                <p className="font-medium">{response.locale}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
