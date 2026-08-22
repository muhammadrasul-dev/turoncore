import { initActiveSection, initHeaderScroll, initMobileMenu, initScrollProgress } from './header.ts';
import { initReveal } from './reveal.ts';
import { initSpotlight } from './spotlight.ts';
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
  const stage = document.getElementById('contact-bubble-stage');
  const bubbleA = document.getElementById('contact-bubble-a');
  const bubbleB = document.getElementById('contact-bubble-b');

  if (!toggleBtn || !popup || !stage || !bubbleA || !bubbleB) return;

  floatingAbort?.abort();
  floatingAbort = new AbortController();
  const signal = floatingAbort.signal;

  let isOpen = false;
  let messages: string[] = [];
  try {
    messages = JSON.parse(stage.getAttribute('data-messages') || '[]');
  } catch {
    messages = [];
  }

  const setMenuOpen = (open: boolean) => {
    isOpen = open;
    toggleBtn.setAttribute('aria-expanded', String(open));
    popup.setAttribute('aria-hidden', String(!open));
    popup.classList.toggle('is-open', open);
  };

  toggleBtn.addEventListener(
    'click',
    (event) => {
      event.stopPropagation();
      setMenuOpen(!isOpen);
    },
    { signal }
  );

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Node;
      if (isOpen && !toggleBtn.contains(target) && !popup.contains(target)) {
        setMenuOpen(false);
      }
    },
    { signal }
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && isOpen) setMenuOpen(false);
    },
    { signal }
  );

  const appearTimer = window.setTimeout(() => {
    if (signal.aborted) return;
    stage.classList.remove('is-hidden');
    stage.classList.add('is-visible');
  }, 600);
  signal.addEventListener('abort', () => window.clearTimeout(appearTimer));

  if (messages.length < 2) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slots = [bubbleA, bubbleB];
  let activeSlot = 0;
  let index = 0;
  let paused = false;
  let rotateTimer = 0;
  let outTimer = 0;
  let gapTimer = 0;
  let inTimer = 0;
  const HOLD_MS = 6800;
  const OUT_MS = reduced ? 0 : 260;
  const GAP_MS = reduced ? 0 : 200;
  const IN_MS = reduced ? 0 : 340;

  const textOf = (el: HTMLElement) => el.querySelector('.contact-bubble-text') as HTMLElement | null;

  const clearRotate = () => {
    if (rotateTimer) window.clearTimeout(rotateTimer);
    if (outTimer) window.clearTimeout(outTimer);
    if (gapTimer) window.clearTimeout(gapTimer);
    if (inTimer) window.clearTimeout(inTimer);
    rotateTimer = 0;
    outTimer = 0;
    gapTimer = 0;
    inTimer = 0;
  };

  const schedule = () => {
    if (rotateTimer) window.clearTimeout(rotateTimer);
    rotateTimer = 0;
    if (signal.aborted || paused) return;
    rotateTimer = window.setTimeout(rotate, HOLD_MS);
  };

  const rotate = () => {
    if (signal.aborted || paused) return;

    const outgoing = slots[activeSlot];
    const incoming = slots[1 - activeSlot];
    const nextIndex = (index + 1) % messages.length;
    const incomingText = textOf(incoming);
    if (incomingText) incomingText.textContent = messages[nextIndex];

    outgoing.classList.remove('is-active', 'is-entering');
    outgoing.classList.add('is-leaving');
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.tabIndex = -1;

    outTimer = window.setTimeout(() => {
      if (signal.aborted) return;
      outgoing.classList.remove('is-leaving');

      gapTimer = window.setTimeout(() => {
        if (signal.aborted) return;

        incoming.classList.remove('is-leaving');
        incoming.classList.add(reduced ? 'is-active' : 'is-entering');
        incoming.setAttribute('aria-hidden', 'false');
        incoming.tabIndex = 0;

        inTimer = window.setTimeout(() => {
          if (signal.aborted) return;
          incoming.classList.remove('is-entering');
          incoming.classList.add('is-active');
          activeSlot = 1 - activeSlot;
          index = nextIndex;
          schedule();
        }, IN_MS);
      }, GAP_MS);
    }, OUT_MS);
  };

  schedule();

  stage.addEventListener(
    'mouseenter',
    () => {
      paused = true;
      clearRotate();
    },
    { signal }
  );
  stage.addEventListener(
    'mouseleave',
    () => {
      paused = false;
      schedule();
    },
    { signal }
  );

  signal.addEventListener('abort', clearRotate);
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
  initCounters();
  bindForms();
  bindFloatingContact();

  const lenis = (window as unknown as { lenis?: { resize?: () => void } }).lenis;
  lenis?.resize?.();
}
