'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Questionnaire {
  id: string;
  name: string;
  locale: string;
  created_at: string;
}

export default function QuestionnairesPage() {
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
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

  const fetchQuestionnaires = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/questionnaire-responses/list?page=${page}`);
      const data = await response.json();

      if (response.ok) {
        setQuestionnaires(data.questionnaires);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.error || '問診票の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      setError('問診票の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page > 0) {
      fetchQuestionnaires();
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
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

  const getLocaleLabel = (locale: string) => {
    const labels: { [key: string]: string } = {
      ja: '日本語',
      en: 'English',
      zh: '中文',
      ko: '한국어',
    };
    return labels[locale] || locale;
  };

  if (loading && questionnaires.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 touch-manipulation"
            >
              ← ダッシュボード
            </Link>
            <h1 className="text-3xl font-bold">問診票一覧</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 touch-manipulation"
          >
            ログアウト
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  患者名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  言語
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questionnaires.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    問診票がありません
                  </td>
                </tr>
              ) : (
                questionnaires.map((q) => (
                  <tr key={q.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {q.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getLocaleLabel(q.locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(q.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/questionnaires/${q.id}`}
                        className="text-blue-600 hover:text-blue-900 touch-manipulation mr-4"
                      >
                        詳細
                      </Link>
                      <Link
                        href={`/admin/preview/${q.id}`}
                        className="text-green-600 hover:text-green-900 touch-manipulation"
                      >
                        PDF
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 touch-manipulation"
            >
              前へ
            </button>
            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 touch-manipulation"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
