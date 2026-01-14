import { Locale } from './config';

export interface Language {
  code: Locale;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
];
