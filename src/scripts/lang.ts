import { bindPage } from './page.ts';

const pageCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

let listenersBound = false;
let switchToken = 0;

function normalizeHref(href: string) {
  const url = new URL(href, window.location.origin);
  const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  return `${path}${url.search}`;
}

function langHref(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');
  return href ? normalizeHref(href) : null;
}

async function loadLangHtml(href: string) {
  const cached = pageCache.get(href);
  if (cached) return cached;

  const pending = inflight.get(href);
  if (pending) return pending;

  const request = fetch(href, { credentials: 'same-origin' })
    .then(async (response) => {
      if (!response.ok) throw new Error('Language page fetch failed');
      const html = await response.text();
      pageCache.set(href, html);
      return html;
    })
    .finally(() => {
      inflight.delete(href);
    });

  inflight.set(href, request);
  return request;
}

function prefetchLang(href: string) {
  if (!href || pageCache.has(href) || inflight.has(href)) return;
  loadLangHtml(href).catch(() => {
    // Ignore prefetch errors. Click handler fetches again if needed.
  });
}

function prefetchOpenLangLinks() {
  document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]').forEach((switcher) => {
    const href = langHref(switcher);
    if (href) prefetchLang(href);
  });
}

function swapSection(current: Element | null, next: Element | null) {
  if (current && next) {
    current.innerHTML = next.innerHTML;
  }
}

function setMenuOpen(dropdown: Element, open: boolean) {
  const trigger = dropdown.querySelector('[data-lang-trigger]');
  const menu = dropdown.querySelector('[data-lang-menu]');
  const chevron = dropdown.querySelector<HTMLElement>('[data-lang-chevron]');
  if (!trigger || !menu) return;

  trigger.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('scale-95', !open);
  menu.classList.toggle('opacity-0', !open);
  menu.classList.toggle('pointer-events-none', !open);
  menu.classList.toggle('scale-100', open);
  menu.classList.toggle('opacity-100', open);
  if (chevron) chevron.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
}

function closeAllLangMenus() {
  document.querySelectorAll('[data-lang-dropdown]').forEach((dropdown) => {
    setMenuOpen(dropdown, false);
  });
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
  prefetchOpenLangLinks();
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('lang-swapping');
  });
}

async function switchLanguage(href: string, pushHistory = true) {
  const target = normalizeHref(href);
  const token = ++switchToken;
  const html = await loadLangHtml(target);
  if (token !== switchToken) return;
  applyPageHtml(html, target, pushHistory);
}

function bindLangListeners() {
  if (listenersBound) return;
  listenersBound = true;

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const trigger = target.closest('[data-lang-trigger]');
    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      const dropdown = trigger.closest('[data-lang-dropdown]');
      if (!dropdown) return;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAllLangMenus();
      if (!isOpen) setMenuOpen(dropdown, true);
      return;
    }

    const switcher = target.closest<HTMLAnchorElement>('[data-lang-switch]');
    if (switcher) {
      const href = langHref(switcher);
      if (!href) return;
      event.preventDefault();
      closeAllLangMenus();
      if (switcher.getAttribute('aria-current') === 'page') return;
      switchLanguage(href, true).catch(() => {
        window.location.href = href;
      });
      return;
    }

    if (!target.closest('[data-lang-dropdown]')) {
      closeAllLangMenus();
    }
  });

  // pointerover bubbles, so it still works after the header html is replaced
  document.addEventListener(
    'pointerover',
    (event) => {
      const switcher = (event.target as HTMLElement | null)?.closest?.('[data-lang-switch]');
      if (!switcher) return;
      const href = langHref(switcher as HTMLAnchorElement);
      if (href) prefetchLang(href);
    },
    true
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllLangMenus();
  });

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

export function initLangSwitchers() {
  bindLangListeners();
  prefetchOpenLangLinks();
}
