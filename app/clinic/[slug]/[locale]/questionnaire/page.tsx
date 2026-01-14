import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { QuestionnaireForm } from '@/components/questionnaire/questionnaire-form';
import { supabaseAdmin } from '@/lib/supabase/server';

interface PageProps {
  params: {
    slug: string;
    locale: string;
  };
}

async function getTemplate(slug: string) {
  // Get tenant
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select('id, template_id')
    .eq('slug', slug)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  // Get template
  const { data: template, error: templateError } = await supabaseAdmin
    .from('form_templates')
    .select('questions_json')
    .eq('id', tenant.template_id)
    .single();

  if (templateError || !template) {
    return null;
  }

  return template.questions_json;
}

export default async function QuestionnairePage({ params }: PageProps) {
  if (!locales.includes(params.locale as any)) {
    notFound();
  }

  const questionsJson = await getTemplate(params.slug);

  if (!questionsJson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">テンプレートが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <QuestionnaireForm
        slug={params.slug}
        locale={params.locale}
        questionsJson={questionsJson}
      />
    </div>
  );
}
