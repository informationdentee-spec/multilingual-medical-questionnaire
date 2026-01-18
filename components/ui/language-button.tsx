'use client';

import { useRouter } from 'next/navigation';

interface LanguageButtonProps {
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
  clinicId: string;
}

export function LanguageButton({ language, clinicId }: LanguageButtonProps) {
  const router = useRouter();

  function handleSelect() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedLanguage', language.code);
      router.push(`/clinic/${clinicId}/${language.code}/questionnaire`);
    }
  }

  return (
    <button
      onClick={handleSelect}
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center min-h-[100px] flex flex-col items-center justify-center border-2 border-gray-200 hover:border-blue-500 active:scale-95 touch-manipulation"
    >
      <div className="font-semibold text-lg mb-1">{language.nativeName}</div>
      <div className="text-sm text-gray-600">{language.name}</div>
    </button>
  );
}
