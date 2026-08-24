let menuAbort: AbortController | null = null;

type NavMode = 'full' | 'compact';

export function initMobileMenu() {
  const header = document.getElementById('site-header');
  const bar = document.getElementById('header-bar');
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('nav-backdrop');
  const top = document.getElementById('bar-top');
  const mid = document.getElementById('bar-mid');
  const bot = document.getElementById('bar-bot');

  if (!header || !bar || !toggle || !menu) return;

  menuAbort?.abort();
  menuAbort = new AbortController();
  const signal = menuAbort.signal;

  let fitting = false;
  let fitRaf = 0;
  let scrollLockedByMenu = false;

  const lockScroll = (lock: boolean) => {
    if (lock) {
      scrollLockedByMenu = true;
      document.documentElement.classList.add('lenis-stopped');
      document.documentElement.style.overflow = 'hidden';
      return;
    }

    if (!scrollLockedByMenu) return;
    scrollLockedByMenu = false;
    document.documentElement.classList.remove('lenis-stopped');
    document.documentElement.style.overflow = '';
  };

  const setState = (open: boolean) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    backdrop?.setAttribute('aria-hidden', String(!open));
    top?.classList.toggle('translate-y-[6px]', open);
    top?.classList.toggle('rotate-45', open);
    mid?.classList.toggle('opacity-0', open);
    bot?.classList.toggle('-translate-y-[6px]', open);
    bot?.classList.toggle('-rotate-45', open);
    lockScroll(open);
  };

  const applyMode = (mode: NavMode) => {
    header.classList.add('nav-ready');
    header.classList.toggle('nav-mode-full', mode === 'full');
    header.classList.toggle('nav-mode-compact', mode === 'compact');
  };

  const fits = () => {
    const available = window.innerWidth - 24;
    return bar.scrollWidth <= available;
  };

  const measureMode = (): NavMode => {
    if (window.innerWidth < 768) return 'compact';

    applyMode('full');
    if (fits()) return 'full';

    return 'compact';
  };

  const scheduleFit = () => {
    if (fitRaf) return;
    fitRaf = window.requestAnimationFrame(() => {
      fitRaf = 0;
      updateNavFit();
    });
  };

  let observer: ResizeObserver;

  const updateNavFit = () => {
    if (fitting) return;
    fitting = true;
    observer.disconnect();

    const next = measureMode();
    applyMode(next);
    if (next !== 'compact' && menu.classList.contains('open')) setState(false);

    observer.observe(bar);
    fitting = false;
  };

  toggle.addEventListener('click', () => setState(!menu.classList.contains('open')), { signal });
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setState(false), { signal });
  });
  backdrop?.addEventListener('click', () => setState(false), { signal });
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') setState(false);
    },
    { signal }
  );
  window.addEventListener('resize', scheduleFit, { signal });

  observer = new ResizeObserver(scheduleFit);
  observer.observe(bar);
  signal.addEventListener('abort', () => {
    observer.disconnect();
    if (fitRaf) window.cancelAnimationFrame(fitRaf);
    lockScroll(false);
  });

  setState(false);
  updateNavFit();
}

let headerScrollAbort: AbortController | null = null;

export function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  headerScrollAbort?.abort();
  headerScrollAbort = new AbortController();

  const COMPACT_AT = 96;
  const EXPAND_AT = 36;
  let compact = header.classList.contains('scrolled');
  let ticking = false;

  const apply = () => {
    const y = window.scrollY;
    if (!compact && y > COMPACT_AT) {
      compact = true;
      header.classList.add('scrolled');
    } else if (compact && y < EXPAND_AT) {
      compact = false;
      header.classList.remove('scrolled');
    }
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };

  window.addEventListener('scroll', onScroll, { passive: true, signal: headerScrollAbort.signal });

  const lenis = (
    window as unknown as { lenis?: { on?: (event: string, cb: () => void) => void; off?: (event: string, cb: () => void) => void } }
  ).lenis;
  if (lenis?.on) {
    lenis.on('scroll', onScroll);
    headerScrollAbort.signal.addEventListener('abort', () => lenis.off?.('scroll', onScroll));
  }

  apply();
}

let progressAbort: AbortController | null = null;

export function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  progressAbort?.abort();
  progressAbort = new AbortController();

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true, signal: progressAbort.signal }
  );
  update();
}

let sectionObserver: IntersectionObserver | null = null;

export function initActiveSection() {
  sectionObserver?.disconnect();
  sectionObserver = null;

  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-navlink]'));
  if (!links.length) return;

  const current = (window.location.pathname.replace(/\/$/, '') || '/');

  const isHome = current === '/' || current === '/ru' || current === '/en';

  links.forEach((link) => {
    const href = new URL(link.getAttribute('href') || '/', window.location.origin).pathname.replace(/\/$/, '') || '/';
    const homeLink = href === '/' || href === '/ru' || href === '/en';
    const active = homeLink ? isHome : current === href || current.startsWith(`${href}/`);
    link.classList.toggle('active', active);
  });
}
