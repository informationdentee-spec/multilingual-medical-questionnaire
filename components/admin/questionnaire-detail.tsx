'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Printer, Download } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  if (error || !response) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">{error || '問診票が見つかりませんでした'}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">問診票詳細</h1>
            <p className="text-sm text-gray-500">
              回答日時: {formatDate(response.created_at)}
            </p>
          </div>
          <button
            onClick={() => router.push(`/clinic/${clinicId}/admin`)}
            className="flex items-center gap-2 px-5 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            一覧へ戻る
          </button>
        </div>
        
        {/* 操作ボタンカード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">PDF操作</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleViewPDF}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FileText className="w-5 h-5" />
              PDFを開く
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Printer className="w-5 h-5" />
              印刷する
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              ダウンロード
            </button>
          </div>
        </div>
        
        {/* 基本情報カード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            基本情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">氏名</label>
              <p className="text-base text-gray-900 font-medium">{data.name || '未入力'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">性別</label>
              <p className="text-base text-gray-900">
                {data.sex === 'male' ? '男' : data.sex === 'female' ? '女' : '未入力'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">生年月日</label>
              <p className="text-base text-gray-900">
                {formatDateValue(data.birth_year, data.birth_month, data.birth_day)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">電話番号</label>
              <p className="text-base text-gray-900">{data.phone || '未入力'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-2">住所</label>
              <p className="text-base text-gray-900">{data.address || '未入力'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">健康保険証</label>
              <p className="text-base text-gray-900">{formatYesNo(data.has_insurance)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">国籍</label>
              <p className="text-base text-gray-900">{data.nationality || '未入力'}</p>
            </div>
          </div>
        </div>
        
        {/* 症状カード */}
        {symptomLabels.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              症状
            </h2>
            <ul className="space-y-3">
              {symptomLabels.map((label, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base text-gray-900 leading-relaxed">{label}</span>
                </li>
              ))}
            </ul>
            {data.symptom_other && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-2">その他</label>
                <p className="text-base text-gray-900 leading-relaxed">{data.symptom_other}</p>
              </div>
            )}
          </div>
        )}
        
        {/* アレルギーカード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            アレルギー
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">アレルギー</label>
              <p className="text-base text-gray-900">{formatYesNo(data.has_allergy)}</p>
            </div>
            {allergyTypeLabels.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">アレルギー種類</label>
                <ul className="space-y-3">
                  {allergyTypeLabels.map((label, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-base text-gray-900 leading-relaxed">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.allergy_other && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">その他</label>
                <p className="text-base text-gray-900 leading-relaxed">{data.allergy_other}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 服薬カード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            服薬
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">服薬中</label>
              <p className="text-base text-gray-900">{formatYesNo(data.is_medicating)}</p>
            </div>
            {data.medication_detail && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">薬の内容</label>
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">{data.medication_detail}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 既往歴カード */}
        {pastDiseaseLabels.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              既往歴
            </h2>
            <ul className="space-y-3 mb-6">
              {pastDiseaseLabels.map((label, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base text-gray-900 leading-relaxed">{label}</span>
                </li>
              ))}
            </ul>
            {data.disease_other && (
              <div className="mb-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-2">その他</label>
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">{data.disease_other}</p>
              </div>
            )}
            <div className="pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-2">現在治療中</label>
              <p className="text-base text-gray-900">{formatYesNo(data.has_under_treatment)}</p>
            </div>
            {data.disease_under_treatment_detail && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">治療内容</label>
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">{data.disease_under_treatment_detail}</p>
              </div>
            )}
          </div>
        )}
        
        {/* 治療希望カード */}
        {treatmentPreferenceLabels.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              治療希望
            </h2>
            <ul className="space-y-3">
              {treatmentPreferenceLabels.map((label, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base text-gray-900 leading-relaxed">{label}</span>
                </li>
              ))}
            </ul>
            {data.treatment_other && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-2">その他</label>
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">{data.treatment_other}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
