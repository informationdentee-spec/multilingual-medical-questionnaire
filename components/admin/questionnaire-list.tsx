'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileText, Printer, Eye, ChevronDown } from 'lucide-react';

interface Questionnaire {
  id: string;
  created_at: string;
  name: string;
  symptoms: string;
  locale: string;
}

interface QuestionnaireListProps {
  clinicId: string;
  clinicName?: string;
}

export function QuestionnaireList({ clinicId, clinicName }: QuestionnaireListProps) {
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // フィルター状態
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const [symptomFilter, setSymptomFilter] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 主要な症状リスト（フィルター用）- 実際のデータベースの値と表示名
  const mainSymptoms = [
    { value: 'toothache', label: '歯痛' },
    { value: 'bleeding', label: '出血' },
    { value: 'swelling', label: '腫れ' },
    { value: 'swollen_gums', label: '歯茎が腫れている' },
    { value: 'sensitive_teeth', label: '歯がしみる' },
    { value: 'lost_filling', label: '詰め物が取れた' },
    { value: 'cleaning', label: '歯のクリーニング' },
    { value: 'checkup', label: '定期検診' },
  ];
  
  useEffect(() => {
    fetchQuestionnaires();
  }, [dateFilter, customDate, symptomFilter, clinicId]);
  
  const fetchQuestionnaires = async () => {
    setLoading(true);
    setError('');
    
    try {
      let dateParam = dateFilter;
      if (dateFilter === 'custom' && customDate) {
        dateParam = customDate;
      }
      
      const params = new URLSearchParams();
      if (dateParam && dateParam !== 'all') {
        params.append('date', dateParam);
      }
      if (symptomFilter) {
        params.append('symptom', symptomFilter);
      }
      
      const response = await fetch(
        `/api/clinic/${clinicId}/admin/questionnaires?${params.toString()}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setQuestionnaires(data.questionnaires || []);
      } else {
        setError(data.error || '問診票の取得に失敗しました');
      }
    } catch (err) {
      setError('問診票の取得に失敗しました');
      console.error('Error fetching questionnaires:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleViewPDF = (id: string) => {
    window.open(`/api/pdf/${id}`, '_blank');
  };
  
  const handlePrintPDF = (id: string) => {
    const printWindow = window.open(`/api/pdf/${id}`, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };
  
  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await fetch(`/api/pdf/${id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questionnaire-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('PDFのダウンロードに失敗しました');
    }
  };
  
  const displayClinicName = clinicName || `${clinicId}歯科クリニック`;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {displayClinicName}
          </h1>
          <p className="text-xl text-gray-600 font-medium">問診票管理</p>
        </div>
        
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 日付フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日付で絞り込む
              </label>
              <div className="flex gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value !== 'custom') {
                      setShowDatePicker(false);
                    } else {
                      setShowDatePicker(true);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="today">今日</option>
                  <option value="yesterday">昨日</option>
                  <option value="custom">日付を選択</option>
                  <option value="all">すべて</option>
                </select>
                {showDatePicker && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </div>
            
            {/* 症状フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                症状で絞り込む
              </label>
              <select
                value={symptomFilter}
                onChange={(e) => setSymptomFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべて</option>
                {mainSymptoms.map((symptom) => (
                  <option key={symptom.value} value={symptom.value}>
                    {symptom.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* テーブル */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              読み込み中...
            </div>
          ) : questionnaires.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              問診票が見つかりませんでした
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      回答時刻
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      患者名
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      症状
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      言語
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questionnaires.map((questionnaire) => (
                    <tr key={questionnaire.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(questionnaire.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {questionnaire.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {questionnaire.symptoms}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {questionnaire.locale.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPDF(questionnaire.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="PDFを開く"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintPDF(questionnaire.id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="印刷"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/clinic/${clinicId}/admin/${questionnaire.id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="詳細を見る"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
