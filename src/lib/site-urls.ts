import { languages } from '../i18n/ui';
import { CONTENT_PATHS, hrefLangMap, localePath } from './routes';

const SITE = 'https://turoncore.uz';

function absolute(path: string, base: string) {
  return new URL(path, base).toString();
}

export function sitemapUrlGroups(site = SITE) {
  const lastmod = new Date().toISOString().slice(0, 10);

  return CONTENT_PATHS.map((path) => {
    const localized = languages.map(({ code }) => ({
      code,
      hrefLang: hrefLangMap[code],
      url: absolute(localePath(path, code), site),
    }));

    return {
      path,
      lastmod,
      defaultUrl: localized.find((item) => item.code === 'uz')?.url ?? absolute(path, site),
      localized,
    };
  });
}
