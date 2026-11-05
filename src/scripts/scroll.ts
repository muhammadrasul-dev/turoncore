import type Lenis from 'lenis';

// Native scrolling only; Lenis made wheel and trackpad scrolling feel sticky
const lenis: Lenis | null = null;
let anchorsBound = false;
let navLock = false;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function headerOffset() {
  return window.innerWidth >= 1024 ? 96 : 80;
}

function samePath(url: URL) {
  const current = window.location.pathname.replace(/\/$/, '') || '/';
  const next = url.pathname.replace(/\/$/, '') || '/';
  return current === next;
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function scrollDuration(distance: number) {
  return Math.min(0.7, 0.35 + distance / 4200);
}

function scrollToTop(onComplete: () => void) {
  const y = window.scrollY;
  if (y < 8) {
    onComplete();
    return;
  }

  const duration = scrollDuration(y);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onComplete();
  };

  if (lenis) {
    lenis.scrollTo(0, {
      duration,
      easing: easeOutCubic,
      onComplete: finish,
    });
    window.setTimeout(finish, duration * 1000 + 200);
    return;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.addEventListener('scrollend', finish, { once: true });
  window.setTimeout(finish, duration * 1000 + 120);
}

function scrollToHash(href: string) {
  const target = document.querySelector(href);
  if (!target) return false;

  const top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - headerOffset();
  const duration = scrollDuration(Math.abs(window.scrollY - top));

  if (lenis) {
    lenis.scrollTo(target as HTMLElement, {
      offset: -headerOffset(),
      duration,
      easing: easeOutCubic,
    });
  } else {
    window.scrollTo({ top, behavior: 'smooth' });
  }

  history.pushState(null, '', href);
  return true;
}

function bindHeaderNav() {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || navLock) return;
    if (isModifiedClick(event)) return;

    const anchor = (event.target as HTMLElement | null)?.closest?.('#site-header a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin) return;

    if (href.startsWith('#') || (samePath(url) && url.hash)) {
      if (url.hash && scrollToHash(url.hash)) event.preventDefault();
      return;
    }

    const leavePage = !samePath(url) || Boolean(url.search);
    if (leavePage) return;

    event.preventDefault();
    if (window.scrollY < 40) return;

    navLock = true;
    scrollToTop(() => {
      navLock = false;
    });
  });
}

export function initSmoothScroll() {
  if (anchorsBound) return;
  anchorsBound = true;

  document.addEventListener('click', (event) => {
    const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (!anchor || anchor.closest('#site-header')) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    if (scrollToHash(href)) {
      event.preventDefault();
    }
  });

  bindHeaderNav();
}
