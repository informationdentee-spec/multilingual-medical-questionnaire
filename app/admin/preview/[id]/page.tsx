'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPDF = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Preview] Fetching PDF for ID:', id);
      
      const response = await fetch(`/api/pdf/${id}`);
      console.log('[Preview] Response status:', response.status);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('[Preview] Content-Type:', contentType);
        
        if (contentType?.includes('application/pdf')) {
          const blob = await response.blob();
          console.log('[Preview] Blob created, size:', blob.size, 'bytes');
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          // If not PDF, try to parse as JSON error
          const data = await response.json();
          console.error('[Preview] Error response:', data);
          setError(data.error || data.details || 'PDFの取得に失敗しました');
        }
      } else {
        // Try to parse error response
        let errorMessage = 'PDFの取得に失敗しました';
        try {
          const data = await response.json();
          errorMessage = data.error || data.details || errorMessage;
          console.error('[Preview] Error response:', data);
        } catch (parseError) {
          console.error('[Preview] Failed to parse error response:', parseError);
          errorMessage = `サーバーエラー (${response.status})`;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('[Preview] Error fetching PDF:', error);
      setError(`PDFの取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  useEffect(() => {
    fetchPDF();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/questionnaires/${id}`}
              className="text-blue-600 hover:text-blue-800 touch-manipulation"
            >
              ← 詳細に戻る
            </Link>
            <h1 className="text-2xl font-bold">PDFプレビュー</h1>
          </div>
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
