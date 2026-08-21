import type { APIRoute } from 'astro';
import { languages } from '../i18n/ui';

const hrefLangMap = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en',
} as const;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL('https://turoncore.uz');
  const localizedUrls = languages.map(({ code }) => ({
    code,
    hrefLang: hrefLangMap[code],
    url: new URL(`/${code}/`, baseUrl).toString(),
  }));

  const alternateLinks = localizedUrls
    .map(
      ({ hrefLang, url }) =>
        `<xhtml:link rel="alternate" hreflang="${hrefLang}" href="${escapeXml(url)}" />`
    )
    .join('');

  const entries = localizedUrls
    .map(
      ({ url }) => `
  <url>
    <loc>${escapeXml(url)}</loc>
    ${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(new URL('/uz/', baseUrl).toString())}" />
  </url>`
    )
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}
</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
};
