import createMiddleware from 'next-intl/middleware';
import { locales } from './lib/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale: 'ja',
  localePrefix: 'as-needed'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|clinic|.*\\..*).*)']
};
