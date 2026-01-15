import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { QuestionnaireForm } from '@/components/questionnaire/questionnaire-form';
import { supabaseAdmin } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string | string[] | undefined; locale: string | string[] | undefined }> | { slug: string | string[] | undefined; locale: string | string[] | undefined };
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
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure slug is a string
  const slug: string = Array.isArray(resolvedParams.slug) 
    ? resolvedParams.slug[0] ?? ''
    : (resolvedParams.slug ?? '');
  
  // Ensure locale is a string
  const locale: string = Array.isArray(resolvedParams.locale) 
    ? resolvedParams.locale[0] ?? 'ja'
    : (resolvedParams.locale ?? 'ja');

  // Validate locale
  if (!locale || typeof locale !== 'string' || !slug || typeof slug !== 'string' || !locales.includes(locale as any)) {
    notFound();
  }

  const questionsJson = await getTemplate(slug);

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
        slug={slug}
        locale={locale}
        questionsJson={questionsJson}
      />
    </div>
  );
}
