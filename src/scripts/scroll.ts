import Lenis from 'lenis';

export function initSmoothScroll() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  // Initialize Lenis with refined parameters for premium performance
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.1,
    infinite: false,
  });

  // Animation frame loop
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Seamless anchor scroll mapping with perfect custom offsets
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        // Determine header offset dynamically based on responsive sizes
        const headerOffset = window.innerWidth >= 1024 ? 96 : 80;
        
        lenis.scrollTo(target as HTMLElement, {
          offset: -headerOffset,
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        
        // Gracefully update browser history hash
        if (history.pushState) {
          history.pushState(null, '', href);
        } else {
          location.hash = href;
        }
      }
    });
  });

  // Expose Lenis globally to allow interactions from other elements
  (window as any).lenis = lenis;
}

// Instantiate on load
if (typeof window !== 'undefined') {
  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
  } else {
    initSmoothScroll();
  }
}
