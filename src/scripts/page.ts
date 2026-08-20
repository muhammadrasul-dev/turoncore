import { initActiveSection, initHeaderScroll, initMobileMenu, initScrollProgress } from './header.ts';
import { initReveal } from './reveal.ts';
import { initSpotlight } from './spotlight.ts';
import { initTheme } from './theme.ts';
import { initCounters } from './counter.ts';

let floatingAbort: AbortController | null = null;

function bindForms() {
  const auditForm = document.getElementById('audit-form') as HTMLFormElement | null;
  const auditSuccess = document.getElementById('audit-success');
  if (auditForm && auditForm.dataset.bound !== '1') {
    auditForm.dataset.bound = '1';
    let auditTimer: number | undefined;
    auditForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!auditForm.checkValidity()) {
        auditForm.reportValidity();
        return;
      }
      auditSuccess?.classList.remove('opacity-0');
      auditForm.reset();
      window.clearTimeout(auditTimer);
      auditTimer = window.setTimeout(() => auditSuccess?.classList.add('opacity-0'), 5000);
    });
  }

  const contactForm = document.getElementById('contact-form') as HTMLFormElement | null;
  const contactSuccess = document.getElementById('form-success');
  if (contactForm && contactForm.dataset.bound !== '1') {
    contactForm.dataset.bound = '1';
    let contactTimer: number | undefined;
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      contactSuccess?.classList.remove('opacity-0');
      contactForm.reset();
      window.clearTimeout(contactTimer);
      contactTimer = window.setTimeout(() => contactSuccess?.classList.add('opacity-0'), 5000);
    });
  }
}

function bindFloatingContact() {
  const toggleBtn = document.getElementById('contact-toggle-btn');
  const popup = document.getElementById('contact-popup');
  const chatIcon = document.getElementById('chat-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!toggleBtn || !popup || !chatIcon || !closeIcon) return;

  floatingAbort?.abort();
  floatingAbort = new AbortController();
  const signal = floatingAbort.signal;

  let isOpen = false;
  const toggleMenu = () => {
    isOpen = !isOpen;
    if (isOpen) {
      popup.classList.remove('pointer-events-none', 'invisible', 'scale-95', 'opacity-0');
      popup.classList.add('scale-100', 'opacity-100');
      chatIcon.classList.add('scale-50', 'opacity-0');
      closeIcon.classList.remove('scale-50', 'opacity-0');
      closeIcon.classList.add('scale-100', 'opacity-100');
    } else {
      popup.classList.remove('scale-100', 'opacity-100');
      popup.classList.add('pointer-events-none', 'invisible', 'scale-95', 'opacity-0');
      chatIcon.classList.remove('scale-50', 'opacity-0');
      chatIcon.classList.add('scale-100', 'opacity-100');
      closeIcon.classList.remove('scale-100', 'opacity-100');
      closeIcon.classList.add('scale-50', 'opacity-0');
    }
  };

  toggleBtn.addEventListener('click', toggleMenu, { signal });
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      if (isOpen && !toggleBtn.contains(target) && !popup.contains(target)) {
        toggleMenu();
      }
    },
    { signal }
  );
}

function showVisibleReveals() {
  document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 80) {
      el.classList.add('visible');
    }
  });
}

export function bindPage() {
  initMobileMenu();
  initHeaderScroll();
  initScrollProgress();
  initActiveSection();
  showVisibleReveals();
  initReveal();
  initSpotlight();
  initTheme();
  initCounters();
  bindForms();
  bindFloatingContact();

  const lenis = (window as unknown as { lenis?: { resize?: () => void } }).lenis;
  lenis?.resize?.();
}
