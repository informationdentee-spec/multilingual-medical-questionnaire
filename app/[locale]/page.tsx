'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');

  const handleGoToClinic = () => {
    const trimmedSlug = slug.trim();
    if (trimmedSlug) {
      router.push(`/clinic/${trimmedSlug}/select-language`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToClinic();
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Multilingual Medical Questionnaire</h1>
        <p className="text-lg text-gray-600 mb-8">
          多言語歯科問診票アプリ
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">問診票を入力する</h2>
          <p className="text-gray-600 mb-6">
            クリニックから提供されたURLにアクセスするか、以下のフォームからクリニックを選択してください。
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="clinic-slug" className="block text-sm font-medium text-gray-700 mb-2">
                クリニックのスラッグを入力
              </label>
              <div className="flex gap-2">
                <input
                  id="clinic-slug"
                  type="text"
                  placeholder="例: test-clinic"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleGoToClinic}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  移動
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">管理画面</h2>
          <p className="text-gray-600 mb-4">
            クリニック管理者の方は、管理画面からログインしてください。
          </p>
          <Link
            href="/admin/login"
            className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            管理画面にログイン
          </Link>
        </div>
      </div>
    </main>
  );
}
