import type { APIRoute } from 'astro';
import { sitemapUrlGroups } from '../lib/site-urls';

export const prerender = true;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site?.toString() ?? 'https://turoncore.uz';
  const groups = sitemapUrlGroups(baseUrl);

  const entries = groups
    .map((group) => {
      const alternates = group.localized
        .map(
          ({ hrefLang, url }) =>
            `<xhtml:link rel="alternate" hreflang="${hrefLang}" href="${escapeXml(url)}" />`
        )
        .join('');

      return group.localized
        .map(
          ({ url }) => `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${group.lastmod}</lastmod>
    ${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(group.defaultUrl)}" />
  </url>`
        )
        .join('');
    })
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
