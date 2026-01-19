import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { getTemplate } from '@/lib/templates/get-template';
import { ConfirmDisplay } from '@/components/confirm/confirm-display';

interface PageProps {
  params: Promise<{ clinicId: string | string[] | undefined; locale: string | string[] | undefined }> | { clinicId: string | string[] | undefined; locale: string | string[] | undefined };
}

export default async function ConfirmPage({ params }: PageProps) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure clinicId is a string
  const clinicId: string = Array.isArray(resolvedParams.clinicId) 
    ? resolvedParams.clinicId[0] ?? ''
    : (resolvedParams.clinicId ?? '');
  
  // Ensure locale is a string
  const locale: string = Array.isArray(resolvedParams.locale) 
    ? resolvedParams.locale[0] ?? 'ja'
    : (resolvedParams.locale ?? 'ja');

  // Validate locale
  if (!locale || typeof locale !== 'string' || !clinicId || typeof clinicId !== 'string' || !locales.includes(locale as any)) {
    notFound();
  }

  const questionsJson = await getTemplate(clinicId);

  if (!questionsJson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">テンプレートが見つかりません</p>
      </div>
    );
  }

  return (
    <ConfirmDisplay
      questionsJson={questionsJson}
      clinicId={clinicId}
      locale={locale}
    />
  );
}
