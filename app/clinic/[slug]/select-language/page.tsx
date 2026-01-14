import { languages } from '@/lib/i18n/languages';
import { supabase } from '@/lib/supabase/client';
import { LanguageButton } from '@/components/ui/language-button';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getTenant(slug: string) {
  const { data, error } = await supabase
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
  const tenant = await getTenant(params.slug);

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
              slug={params.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

