let revealObserver: IntersectionObserver | null = null;

export function initReveal() {
  revealObserver?.disconnect();
  revealObserver = null;

  const elements = document.querySelectorAll('.reveal, .reveal-scale');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver?.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => revealObserver?.observe(el));
}
