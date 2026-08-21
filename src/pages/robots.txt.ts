import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL('https://turoncore.uz');
  const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString();

  return new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${sitemapUrl}`,
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    }
  );
};
