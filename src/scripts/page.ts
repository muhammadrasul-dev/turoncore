import { initActiveSection, initHeaderScroll, initMobileMenu, initScrollProgress } from './header.ts';
import { initReveal } from './reveal.ts';
import { initSpotlight } from './spotlight.ts';
import { initTheme } from './theme.ts';
import { initCounters } from './counter.ts';
import { bindLeadForm } from './forms.ts';

let floatingAbort: AbortController | null = null;

function bindForms() {
  bindLeadForm('audit-form', 'audit', 'audit-success', 'audit-error');
  bindLeadForm('contact-form', 'contact', 'form-success', 'form-error');
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
