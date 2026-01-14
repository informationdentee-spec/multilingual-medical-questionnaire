'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPDF();
  }, [id]);

  const fetchPDF = async () => {
    try {
      const response = await fetch(`/api/pdf/${id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        const data = await response.json();
        setError(data.error || 'PDFの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
      setError('PDFの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/questionnaires')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 touch-manipulation"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">PDFプレビュー</h1>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 touch-manipulation min-h-[44px]"
            >
              印刷
            </button>
            <button
              onClick={() => router.push('/admin/questionnaires')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 touch-manipulation min-h-[44px]"
            >
              一覧に戻る
            </button>
          </div>
        </div>

        {pdfUrl && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <iframe
              src={pdfUrl}
              className="w-full h-screen border-0"
              title="PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
