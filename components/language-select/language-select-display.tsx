'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { languages, Language } from '@/lib/i18n/languages';

interface LanguageSelectDisplayProps {
  clinicId: string;
  clinicName?: string;
}

export function LanguageSelectDisplay({ clinicId, clinicName }: LanguageSelectDisplayProps) {
  const router = useRouter();
  const [isOtherLanguagesOpen, setIsOtherLanguagesOpen] = useState(false);

  // 日本語を除く言語リスト
  const otherLanguages = languages.filter(lang => lang.code !== 'ja');

  const handleJapaneseClick = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedLanguage', 'ja');
      router.push(`/clinic/${clinicId}/ja/questionnaire`);
    }
  };

  const handleOtherLanguageClick = (languageCode: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedLanguage', languageCode);
      router.push(`/clinic/${clinicId}/${languageCode}/questionnaire`);
    }
  };

  // クリニック名を取得（clinicNameがなければclinicIdを使用）
  const displayClinicName = clinicName || `${clinicId}歯科クリニック`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* クリニック名ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            {displayClinicName}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-normal">
            問診票入力ページ
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 border border-gray-100">
          {/* メインボタン（日本語） */}
          <div className="mb-6">
            <button
              onClick={handleJapaneseClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-7 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] touch-manipulation"
            >
              問診票を開始する
            </button>
          </div>

          {/* 外国語ユーザー向け導線 */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setIsOtherLanguagesOpen(!isOtherLanguagesOpen)}
              className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 py-4 px-4 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
            >
              <span className="text-lg font-medium">Language options / 言語選択</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isOtherLanguagesOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 折りたたみコンテンツ */}
            {isOtherLanguagesOpen && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {otherLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleOtherLanguageClick(language.code)}
                    className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800 py-4 px-4 rounded-lg text-center transition-all duration-200 active:scale-95 touch-manipulation"
                  >
                    <div className="font-semibold text-base mb-1">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
