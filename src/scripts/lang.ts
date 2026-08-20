import { bindPage } from './page.ts';

const pageCache = new Map<string, string>();

function normalizeHref(href: string) {
  const url = new URL(href, window.location.origin);
  const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  return `${path}${url.search}`;
}

function langHref(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');
  return href ? normalizeHref(href) : null;
}

function cacheCurrentPage() {
  const href = normalizeHref(window.location.pathname + window.location.search);
  if (!pageCache.has(href)) {
    pageCache.set(href, `<!DOCTYPE html>${document.documentElement.outerHTML}`);
  }
}

async function prefetchLang(href: string) {
  if (!href || pageCache.has(href)) return;
  try {
    const response = await fetch(href, { credentials: 'same-origin' });
    if (!response.ok) return;
    pageCache.set(href, await response.text());
  } catch {
    // Keep the current page if prefetch fails.
  }
}

function swapSection(current: Element | null, next: Element | null) {
  if (current && next) {
    current.innerHTML = next.innerHTML;
  }
}

function applyPageHtml(html: string, href: string, pushHistory: boolean) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  document.documentElement.classList.add('lang-swapping');

  swapSection(document.getElementById('header-bar'), doc.getElementById('header-bar'));
  swapSection(document.getElementById('mobile-menu'), doc.getElementById('mobile-menu'));
  swapSection(document.getElementById('main'), doc.getElementById('main'));
  swapSection(document.querySelector('footer'), doc.querySelector('footer'));
  swapSection(document.getElementById('floating-contact'), doc.getElementById('floating-contact'));

  const newLang = doc.documentElement.getAttribute('lang') || 'uz';
  document.documentElement.setAttribute('lang', newLang);
  document.title = doc.title;

  const currentDesc = document.querySelector('meta[name="description"]');
  const newDesc = doc.querySelector('meta[name="description"]');
  if (currentDesc && newDesc) {
    currentDesc.setAttribute('content', newDesc.getAttribute('content') || '');
  }

  if (pushHistory) {
    history.pushState({ langHref: href }, '', href);
  }

  bindPage();
  initLangSwitchers();
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('lang-swapping');
  });
}

async function switchLanguage(href: string, pushHistory = true) {
  cacheCurrentPage();
  const target = normalizeHref(href);
  let html = pageCache.get(target);
  if (!html) {
    const response = await fetch(target, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Language page fetch failed');
    html = await response.text();
    pageCache.set(target, html);
  }

  applyPageHtml(html, target, pushHistory);
}

export function initLangSwitchers() {
  const switchers = document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]');

  switchers.forEach((switcher) => {
    const href = langHref(switcher);
    if (href) prefetchLang(href);

    if (switcher.dataset.listenerBound === 'true') return;
    switcher.dataset.listenerBound = 'true';

    switcher.addEventListener('pointerenter', () => {
      const target = langHref(switcher);
      if (target) prefetchLang(target);
    });

    switcher.addEventListener('click', async (event) => {
      const target = langHref(switcher);
      if (!target) return;
      if (switcher.getAttribute('aria-current') === 'page') {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      try {
        await switchLanguage(target, true);
      } catch (err) {
        console.error('Language switch failed', err);
        window.location.href = target;
      }
    });
  });
}

if (typeof window !== 'undefined' && !(window as unknown as { __tcLangPopstate?: boolean }).__tcLangPopstate) {
  (window as unknown as { __tcLangPopstate?: boolean }).__tcLangPopstate = true;
  window.addEventListener('popstate', () => {
    const href = `${window.location.pathname}${window.location.search}`;
    if (!/^\/(uz|ru|en)(\/|$)/.test(href)) return;

    const currentLang = document.documentElement.getAttribute('lang');
    const nextLang = href.split('/').filter(Boolean)[0];
    if (currentLang === nextLang) return;

    switchLanguage(href, false).catch(() => {
      window.location.reload();
    });
  });
}
