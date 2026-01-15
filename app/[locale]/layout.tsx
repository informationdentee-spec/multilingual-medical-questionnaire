import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string | string[] | undefined }> | { locale: string | string[] | undefined };
}) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure locale is a string
  const locale: string = Array.isArray(resolvedParams.locale) 
    ? resolvedParams.locale[0] ?? 'ja'
    : (resolvedParams.locale ?? 'ja');

  // Validate locale
  if (!locale || typeof locale !== 'string' || !locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
