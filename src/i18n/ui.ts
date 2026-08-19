import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

export type Lang = 'uz' | 'ru' | 'en';

export const languages: { code: Lang; label: string }[] = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

const translations = { uz, ru, en } as const;

export type Translations = (typeof translations)['uz'];

export function getTranslations(lang: Lang): Translations {
  return translations[lang];
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'ru' || lang === 'en') return lang;
  return 'uz';
}

export function getLocalizedPath(path: string, lang: Lang): string {
  const cleanPath = path.replace(/^\/(uz|ru|en)/, '') || '/';
  return `/${lang}${cleanPath === '/' ? '/' : cleanPath}`;
}
