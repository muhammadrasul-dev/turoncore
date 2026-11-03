import { getLocalizedPath, languages, type Lang } from '../i18n/ui';

export const hrefLangMap = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en',
} as const;

export const ogLocaleMap = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
} as const;

export const SERVICE_SLUGS = [
  'mobile-apps',
  'partnership',
  'dedicated-team',
  'discovery',
  'web',
] as const;

export const PROJECT_SLUGS = [
  'yubomarket',
  'nasiya',
  'yagumarket',
  'onefin',
  'autoteacher',
  'fasgo',
  'yangitv',
  'tmschool',
  'barakatop',
  'pitgo',
] as const;

export const BLOG_SLUGS = [
  'mobil-ilova-narxi',
  'flutter-vs-native',
  'mvp-4-6-hafta',
  'white-label-mobile',
  'ilovani-yaxshilash',
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];
export type ProjectSlug = (typeof PROJECT_SLUGS)[number];
export type BlogSlug = (typeof BLOG_SLUGS)[number];

export const CONTENT_PATHS = [
  '/',
  '/services',
  ...SERVICE_SLUGS.map((slug) => `/services/${slug}`),
  '/projects',
  ...PROJECT_SLUGS.map((slug) => `/projects/${slug}`),
  '/blog',
  ...BLOG_SLUGS.map((slug) => `/blog/${slug}`),
  '/contact',
] as const;

export function localePath(path: string, lang: Lang) {
  return getLocalizedPath(path, lang);
}

export function alternateUrls(path: string) {
  return languages.map(({ code }) => ({
    code,
    hrefLang: hrefLangMap[code],
    path: getLocalizedPath(path, code),
  }));
}

export function defaultLocaleUrl(path: string) {
  return getLocalizedPath(path, 'uz');
}
