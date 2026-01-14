import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = [
  'ja', 'zh', 'ko', 'tl', 'pt', 'es', 'vi', 'en', 'th', 'id', 
  'km', 'ne', 'lo', 'de', 'ru', 'fr', 'fa', 'ar', 'hr', 'ta', 
  'si', 'uk', 'my', 'mn'
] as const;

export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
