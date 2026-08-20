let menuAbort: AbortController | null = null;

export function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const top = document.getElementById('bar-top');
  const mid = document.getElementById('bar-mid');
  const bot = document.getElementById('bar-bot');

  if (!toggle || !menu) return;

  menuAbort?.abort();
  menuAbort = new AbortController();
  const signal = menuAbort.signal;

  const setState = (open: boolean) => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    top?.classList.toggle('translate-y-[6px]', open);
    top?.classList.toggle('rotate-45', open);
    mid?.classList.toggle('opacity-0', open);
    bot?.classList.toggle('-translate-y-[6px]', open);
    bot?.classList.toggle('-rotate-45', open);
  };

  toggle.addEventListener('click', () => setState(!menu.classList.contains('open')), { signal });
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setState(false), { signal });
  });
  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth >= 1024) setState(false);
    },
    { signal }
  );
}

let headerScrollAbort: AbortController | null = null;

export function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  headerScrollAbort?.abort();
  headerScrollAbort = new AbortController();

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true, signal: headerScrollAbort.signal });
  onScroll();
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

  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[data-navlink]')
  );
  if (!links.length) return;

  const map = new Map<string, HTMLAnchorElement>();
  const targets: Element[] = [];

  links.forEach((link) => {
    const id = link.dataset.navlink?.replace('#', '');
    if (!id) return;
    const section = document.getElementById(id);
    if (!section) return;
    map.set(id, link);
    targets.push(section);
  });

  const visible = new Set<string>();

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      const current = targets.map((s) => s.id).find((id) => visible.has(id));
      map.forEach((link, id) => link.classList.toggle('active', id === current));
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  targets.forEach((section) => sectionObserver?.observe(section));
}
