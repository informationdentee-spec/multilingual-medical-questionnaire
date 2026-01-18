import { notFound } from 'next/navigation';
import { languages } from '@/lib/i18n/languages';
import { supabaseAdmin } from '@/lib/supabase/server';
import { LanguageButton } from '@/components/ui/language-button';
import { QuestionnaireForm } from '@/components/questionnaire/questionnaire-form';

interface PageProps {
  params: Promise<{ clinicId: string | string[] | undefined }> | { clinicId: string | string[] | undefined };
}

async function getTenant(clinicId: string) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('id, slug, name')
    .eq('slug', clinicId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getTestTemplate() {
  // Get standard template for test mode
  // Try to get the first available template if standard template doesn't exist
  const { data: standardTemplate, error: standardError } = await supabaseAdmin
    .from('form_templates')
    .select('questions_json')
    .eq('template_name', '標準テンプレート')
    .single();

  if (!standardError && standardTemplate && standardTemplate.questions_json) {
    return standardTemplate.questions_json;
  }

  // If standard template doesn't exist, try to get any template
  const { data: anyTemplate, error: anyError } = await supabaseAdmin
    .from('form_templates')
    .select('questions_json')
    .limit(1)
    .single();

  if (!anyError && anyTemplate && anyTemplate.questions_json) {
    return anyTemplate.questions_json;
  }

  // If no template exists, return a minimal test template
  // This matches the structure expected by QuestionnaireForm
  return {
    sections: [
      {
        id: 'basic',
        title: {
          ja: '基本情報',
          en: 'Basic Information',
        },
        fields: [
          {
            id: 'name',
            type: 'text',
            label: {
              ja: '氏名',
              en: 'Name',
            },
            required: true,
          },
          {
            id: 'phone',
            type: 'text',
            label: {
              ja: '電話番号',
              en: 'Phone',
            },
            required: false,
          },
        ],
      },
    ],
  };
}

export default async function ClinicPage({ params }: PageProps) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure clinicId is a string
  const clinicId: string = Array.isArray(resolvedParams.clinicId) 
    ? resolvedParams.clinicId[0] ?? ''
    : (resolvedParams.clinicId ?? '');

  if (!clinicId) {
    notFound();
  }

  // Test mode: If clinicId is "test", display questionnaire form directly
  if (clinicId === 'test') {
    const questionsJson = await getTestTemplate();
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <QuestionnaireForm
          slug="test"
          locale="ja"
          questionsJson={questionsJson}
        />
      </div>
    );
  }

  // Production mode: Get tenant information (clinicId is used as slug in database)
  const tenant = await getTenant(clinicId);

  // If tenant doesn't exist, return 404
  if (!tenant) {
    notFound();
  }

  // Display language selection page directly
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">言語を選択</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {languages.map((language) => (
            <LanguageButton
              key={language.code}
              language={language}
              clinicId={clinicId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
