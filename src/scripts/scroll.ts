import Lenis from 'lenis';

let lenis: Lenis | null = null;
let anchorsBound = false;

function headerOffset() {
  return window.innerWidth >= 1024 ? 96 : 80;
}

function scrollToHash(href: string) {
  const target = document.querySelector(href);
  if (!target) return false;

  if (lenis) {
    lenis.scrollTo(target as HTMLElement, {
      offset: -headerOffset(),
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top, behavior: 'smooth' });
  }

  history.pushState(null, '', href);
  return true;
}

export function initSmoothScroll() {
  if (!lenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1,
      infinite: false,
    });

    const raf = (time: number) => {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    (window as unknown as { lenis: Lenis }).lenis = lenis;
  }

  if (anchorsBound) return;
  anchorsBound = true;

  document.addEventListener('click', (event) => {
    const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    if (scrollToHash(href)) {
      event.preventDefault();
    }
  });
}
