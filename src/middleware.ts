import { defineMiddleware } from 'astro:middleware';
import { middleware as i18nMiddleware } from 'astro:i18n';

const i18n = i18nMiddleware({
  prefixDefaultLocale: true,
  redirectToDefaultLocale: false,
  fallbackType: 'redirect',
});

// Keep /api outside locale prefix rules so the contact endpoint stays reachable.
export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith('/api/')) {
    return next();
  }

  return i18n(context, next);
});
