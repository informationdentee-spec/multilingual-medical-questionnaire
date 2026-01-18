import { languages } from '@/lib/i18n/languages';
import { supabaseAdmin } from '@/lib/supabase/server';
import { LanguageButton } from '@/components/ui/language-button';

interface PageProps {
  params: Promise<{ slug: string | string[] | undefined }> | { slug: string | string[] | undefined };
}

async function getTenant(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('id, slug')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function SelectLanguagePage({ params }: PageProps) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure slug is a string
  const slug: string = Array.isArray(resolvedParams.slug) 
    ? resolvedParams.slug[0] ?? ''
    : (resolvedParams.slug ?? '');

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">クリニックのスラッグが指定されていません</p>
      </div>
    );
  }

  const tenant = await getTenant(slug);

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">クリニックが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">言語を選択</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {languages.map((language) => (
            <LanguageButton
              key={language.code}
              language={language}
              slug={slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

