import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { CompleteDisplay } from '@/components/complete/complete-display';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

interface PageProps {
  params: Promise<{ clinicId: string | string[] | undefined; locale: string | string[] | undefined }> | { clinicId: string | string[] | undefined; locale: string | string[] | undefined };
}

export default async function CompletePage({ params }: PageProps) {
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

  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <CompleteDisplay
        clinicId={clinicId}
        locale={locale}
      />
    </NextIntlClientProvider>
  );
}
