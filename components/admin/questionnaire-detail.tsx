'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Printer, Download, Calendar, User, Phone, MapPin } from 'lucide-react';
import { valuesToLabels } from '@/lib/templates/value-to-label';

interface QuestionnaireDetailProps {
  clinicId: string;
  responseId: string;
}

interface QuestionnaireResponse {
  id: string;
  clinic_id: string;
  locale: string;
  data: any;
  created_at: string;
}

export function QuestionnaireDetail({ clinicId, responseId }: QuestionnaireDetailProps) {
  const router = useRouter();
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questionsJson, setQuestionsJson] = useState<any>(null);
  
  useEffect(() => {
    fetchDetail();
    fetchTemplate();
  }, [clinicId, responseId]);
  
  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/clinic/${clinicId}/admin/questionnaires/${responseId}`);
      const data = await res.json();
      
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || '問診票の取得に失敗しました');
      }
    } catch (err) {
      setError('問診票の取得に失敗しました');
      console.error('Error fetching questionnaire detail:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates?clinic_id=${clinicId}`);
      const data = await res.json();
      if (res.ok && data.template) {
        setQuestionsJson(data.template);
      }
    } catch (err) {
      console.error('Error fetching template:', err);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatYesNo = (value: boolean | null | undefined) => {
    if (value === true) return 'あり';
    if (value === false) return 'なし';
    return '未回答';
  };
  
  const formatDateValue = (year: number | null, month: number | null, day: number | null) => {
    if (!year || !month || !day) return '未入力';
    return `${year}年${month}月${day}日`;
  };
  
  const handleViewPDF = () => {
    window.open(`/api/pdf/${responseId}`, '_blank');
  };
  
  const handlePrintPDF = () => {
    const printWindow = window.open(`/api/pdf/${responseId}`, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };
  
  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`/api/pdf/${responseId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questionnaire-${responseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('PDFのダウンロードに失敗しました');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }
  
  if (error || !response) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || '問診票が見つかりませんでした'}
          </div>
        </div>
      </div>
    );
  }
  
  const data = response.data || {};
  const locale = response.locale || 'ja';
  
  // ラベル変換
  const symptomLabels = Array.isArray(data.symptoms)
    ? valuesToLabels(data.symptoms, 'symptoms', questionsJson, locale)
    : [];
  const allergyTypeLabels = Array.isArray(data.allergy_types)
    ? valuesToLabels(data.allergy_types, 'allergy_types', questionsJson, locale)
    : [];
  const pastDiseaseLabels = Array.isArray(data.past_diseases)
    ? valuesToLabels(data.past_diseases, 'past_diseases', questionsJson, locale)
    : [];
  const treatmentPreferenceLabels = Array.isArray(data.treatment_preferences)
    ? valuesToLabels(data.treatment_preferences, 'treatment_preferences', questionsJson, locale)
    : [];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">問診票詳細</h1>
            <p className="text-sm text-gray-500">
              回答日時: {formatDate(response.created_at)}
            </p>
          </div>
          <button
            onClick={() => router.push(`/clinic/${clinicId}/admin`)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            一覧へ戻る
          </button>
        </div>
        
        {/* 操作ボタン */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleViewPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDFを開く
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              印刷する
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              ダウンロード
            </button>
          </div>
        </div>
        
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            基本情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">氏名</label>
              <p className="text-base text-gray-900 mt-1">{data.name || '未入力'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">性別</label>
              <p className="text-base text-gray-900 mt-1">
                {data.sex === 'male' ? '男' : data.sex === 'female' ? '女' : '未入力'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">生年月日</label>
              <p className="text-base text-gray-900 mt-1">
                {formatDateValue(data.birth_year, data.birth_month, data.birth_day)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">電話番号</label>
              <p className="text-base text-gray-900 mt-1">{data.phone || '未入力'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">住所</label>
              <p className="text-base text-gray-900 mt-1">{data.address || '未入力'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">健康保険証</label>
              <p className="text-base text-gray-900 mt-1">{formatYesNo(data.has_insurance)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">国籍</label>
              <p className="text-base text-gray-900 mt-1">{data.nationality || '未入力'}</p>
            </div>
          </div>
        </div>
        
        {/* 症状 */}
        {symptomLabels.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              症状
            </h2>
            <ul className="space-y-2">
              {symptomLabels.map((label, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-base text-gray-900">{label}</span>
                </li>
              ))}
            </ul>
            {data.symptom_other && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">その他</label>
                <p className="text-base text-gray-900 mt-1">{data.symptom_other}</p>
              </div>
            )}
          </div>
        )}
        
        {/* アレルギー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            アレルギー
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">アレルギー</label>
              <p className="text-base text-gray-900 mt-1">{formatYesNo(data.has_allergy)}</p>
            </div>
            {allergyTypeLabels.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">アレルギー種類</label>
                <ul className="mt-2 space-y-2">
                  {allergyTypeLabels.map((label, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-base text-gray-900">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.allergy_other && (
              <div>
                <label className="text-sm font-medium text-gray-500">その他</label>
                <p className="text-base text-gray-900 mt-1">{data.allergy_other}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 服薬 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            服薬
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">服薬中</label>
              <p className="text-base text-gray-900 mt-1">{formatYesNo(data.is_medicating)}</p>
            </div>
            {data.medication_detail && (
              <div>
                <label className="text-sm font-medium text-gray-500">薬の内容</label>
                <p className="text-base text-gray-900 mt-1">{data.medication_detail}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 既往歴 */}
        {pastDiseaseLabels.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              既往歴
            </h2>
            <ul className="space-y-2">
              {pastDiseaseLabels.map((label, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-base text-gray-900">{label}</span>
                </li>
              ))}
            </ul>
            {data.disease_other && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">その他</label>
                <p className="text-base text-gray-900 mt-1">{data.disease_other}</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-500">現在治療中</label>
              <p className="text-base text-gray-900 mt-1">{formatYesNo(data.has_under_treatment)}</p>
            </div>
            {data.disease_under_treatment_detail && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">治療内容</label>
                <p className="text-base text-gray-900 mt-1">{data.disease_under_treatment_detail}</p>
              </div>
            )}
          </div>
        )}
        
        {/* 治療希望 */}
        {treatmentPreferenceLabels.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              治療希望
            </h2>
            <ul className="space-y-2">
              {treatmentPreferenceLabels.map((label, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-base text-gray-900">{label}</span>
                </li>
              ))}
            </ul>
            {data.treatment_other && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">その他</label>
                <p className="text-base text-gray-900 mt-1">{data.treatment_other}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
