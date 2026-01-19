'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState('');
  const [printerEmail, setPrinterEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      // Get clinic_id from tenant
      if (data.tenant_id) {
        const tenantResponse = await fetch(`/api/tenants/${data.tenant_id}`);
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          setClinicId(tenantData.slug || '');
        }
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSettings = async () => {
    if (!clinicId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/clinic-settings?clinic_id=${clinicId}`);
      const data = await response.json();

      if (response.ok) {
        setPrinterEmail(data.printer_email || '');
      } else {
        setError(data.error || '設定の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('設定の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      fetchSettings();
    }
  }, [clinicId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/clinic-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          printer_email: printerEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('設定を保存しました');
      } else {
        setError(data.error || data.details || '設定の保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading && !clinicId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 touch-manipulation"
            >
              ← ダッシュボード
            </Link>
            <h1 className="text-3xl font-bold">クリニック設定</h1>
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

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="clinic_id" className="block text-sm font-medium text-gray-700 mb-2">
                クリニックID
              </label>
              <input
                type="text"
                id="clinic_id"
                value={clinicId}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                このIDは変更できません
              </p>
            </div>

            <div>
              <label htmlFor="printer_email" className="block text-sm font-medium text-gray-700 mb-2">
                プリンターメールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="printer_email"
                value={printerEmail}
                onChange={(e) => setPrinterEmail(e.target.value)}
                required
                placeholder="printer@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                問診票のPDFを自動印刷するプリンターのメールアドレスを入力してください
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Link
                href="/admin"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 touch-manipulation"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
