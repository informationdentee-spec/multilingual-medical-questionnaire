'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
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

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/questionnaire-responses/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error || '統計情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('統計情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold">管理ダッシュボード</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">総問診票数</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">今日</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">今週</h3>
            <p className="text-3xl font-bold text-green-600">{stats.thisWeek}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">今月</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.thisMonth}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/questionnaires"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow touch-manipulation"
          >
            <h2 className="text-xl font-semibold mb-2">問診票一覧</h2>
            <p className="text-gray-600">保存された問診票を確認・管理</p>
          </Link>
          <Link
            href="/admin/settings"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow touch-manipulation"
          >
            <h2 className="text-xl font-semibold mb-2">クリニック設定</h2>
            <p className="text-gray-600">プリンターメールアドレスなどの設定</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
