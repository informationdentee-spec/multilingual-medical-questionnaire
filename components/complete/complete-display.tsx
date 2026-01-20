'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface CompleteDisplayProps {
  clinicId: string;
  locale: string;
}

export function CompleteDisplay({ clinicId, locale }: CompleteDisplayProps) {
  const router = useRouter();
  const t = useTranslations('complete');

  const handleGoToReception = () => {
    router.push(`/clinic/${clinicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        </div>
        <p className="text-base text-gray-700 leading-relaxed mb-8">
          {t('message')}
        </p>
        <button
          onClick={handleGoToReception}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors touch-manipulation min-h-[60px] min-w-[200px] w-full"
        >
          {t('goToReception')}
        </button>
      </div>
    </div>
  );
}
