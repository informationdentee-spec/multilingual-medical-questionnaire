import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { RequestConfig } from 'next-intl/server';

export const locales = [
  'ja', 'zh', 'ko', 'tl', 'pt', 'es', 'vi', 'en', 'th', 'id', 
  'km', 'ne', 'lo', 'de', 'ru', 'fr', 'fa', 'ar', 'hr', 'ta', 
  'si', 'uk', 'my', 'mn'
] as const;

export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }): Promise<RequestConfig> => {
  // Ensure locale is defined (handle undefined case)
  // Use default locale 'ja' if locale is undefined or not a string
  const validLocale: string = (typeof locale === 'string' && locale) ? locale : 'ja';

  // Validate that the locale is in the allowed locales list
  if (!validLocale || !locales.includes(validLocale as Locale)) {
    notFound();
  }

  // At this point, validLocale is guaranteed to be a string and valid locale
  // Load messages for the locale
  const messages = (await import(`./locales/${validLocale}.json`)).default;

  // Return RequestConfig with required locale property (validLocale is string)
  return {
    locale: validLocale,
    messages
  };
});
