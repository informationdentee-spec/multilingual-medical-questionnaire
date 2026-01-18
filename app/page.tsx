import Link from 'next/link';

export default function HomePage() {
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
            クリニックから提供された固有URLに直接アクセスしてください。
          </p>
          <p className="text-sm text-gray-500">
            例: <code className="bg-gray-100 px-2 py-1 rounded">/clinic/12345</code> または <code className="bg-gray-100 px-2 py-1 rounded">/clinic/abc</code>
          </p>
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
