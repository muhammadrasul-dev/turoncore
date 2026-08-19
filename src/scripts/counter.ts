export function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(element: Element, start: number, end: number, duration: number) {
    if (prefersReduced) {
      element.textContent = end.toString();
      return;
    }

    const startTime = performance.now();
    const range = end - start;

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + range * easeOutQuart);

      element.textContent = current.toString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end.toString();
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-counter') || '0');
          const duration = parseInt(entry.target.getAttribute('data-duration') || '2000');
          animateCounter(entry.target, 0, target, duration);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

if (typeof window !== 'undefined') {
  initCounters();
}
