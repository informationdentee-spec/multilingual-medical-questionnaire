'use client';

import { useRouter, useParams } from 'next/navigation';

export default function CompletePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const locale = params.locale as string;

  const handleNewQuestionnaire = () => {
    router.push(`/clinic/${slug}/select-language`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">保存完了</h1>
        <p className="text-lg text-gray-600 mb-8">問診票を保存しました</p>
        <button
          onClick={handleNewQuestionnaire}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 touch-manipulation min-h-[60px] min-w-[200px]"
        >
          新しい問診票を入力する
        </button>
      </div>
    </div>
  );
}
