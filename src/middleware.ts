import { defineMiddleware } from 'astro:middleware';
import { middleware as i18nMiddleware } from 'astro:i18n';

const i18n = i18nMiddleware({
  prefixDefaultLocale: false,
  redirectToDefaultLocale: false,
  fallbackType: 'redirect',
});

function withoutUzPrefix(pathname: string) {
  if (pathname === '/uz') return '/';
  if (pathname.startsWith('/uz/')) {
    const rest = pathname.slice(3);
    return rest || '/';
  }
  return null;
}

// Keep /api outside locale prefix rules so the contact endpoint stays reachable.
export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith('/api/')) {
    return next();
  }

  const unprefixed = withoutUzPrefix(context.url.pathname);
  if (unprefixed) {
    return context.redirect(`${unprefixed}${context.url.search}`, 301);
  }

  return i18n(context, next);
});
