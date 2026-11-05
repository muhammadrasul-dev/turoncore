import { hasSubmittedLead, markLeadSubmitted, readLeadForm, submitLead } from './forms.ts';

const SESSION_KEY = 'tc-modal-shown';
const LAST_SHOWN_KEY = 'tc-modal-last-shown';
const COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;
// The modal only opens on desktop exit intent; timers, scroll depth and taps interrupted reading
const EXIT_MIN_MS = 12000;
const OTHER_MODAL_GAP_MS = 8000;

let cleanupModal: (() => void) | undefined;

function storageGet(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // storage may be blocked
  }
}

function isDesktopPointer() {
  return window.matchMedia('(pointer: fine) and (hover: hover)').matches && window.innerWidth >= 768;
}

function isContactInView() {
  if (location.hash === '#contact') return true;
  const contact = document.getElementById('contact');
  if (!contact) return false;
  const rect = contact.getBoundingClientRect();
  const viewH = window.innerHeight || document.documentElement.clientHeight;
  const visible = Math.min(rect.bottom, viewH) - Math.max(rect.top, 0);
  return visible > viewH * 0.25;
}

function isOtherModalOpen() {
  const overlay = document.getElementById('case-study-overlay');
  return Boolean(overlay && overlay.classList.contains('opacity-100'));
}

function isContactFormActive() {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  return Boolean(active.closest('#contact-form, #audit-form'));
}

function bindContactModal() {
  const backdrop = document.getElementById('contact-modal-backdrop');
  const closeBtn = document.getElementById('contact-modal-close');
  const form = document.getElementById('contact-modal-form') as HTMLFormElement | null;
  const successScreen = document.getElementById('modal-success-screen');
  const errorEl = document.getElementById('modal-form-error');

  if (!backdrop || !closeBtn) return;

  const abort = new AbortController();
  const { signal } = abort;
  const startedAt = Date.now();

  let armed = false;
  let opened = false;
  let otherModalWasOpen = false;
  let otherModalClosedAt = 0;
  let successTimer: number | undefined;

  function lockPage() {
    document.documentElement.classList.add('lenis-stopped');
    document.body.style.overflow = 'hidden';
  }

  function unlockPage() {
    document.documentElement.classList.remove('lenis-stopped');
    document.body.style.overflow = '';
  }

  function canShowByFrequency() {
    if (hasSubmittedLead()) return false;
    if (storageGet(sessionStorage, SESSION_KEY) === '1') return false;
    const lastShown = Number(storageGet(localStorage, LAST_SHOWN_KEY) || 0);
    if (lastShown && Date.now() - lastShown < COOLDOWN_MS) return false;
    return true;
  }

  function isBlocked() {
    if (opened || backdrop.classList.contains('open')) return true;
    if (isContactInView() || isContactFormActive()) return true;

    const otherOpen = isOtherModalOpen();
    if (otherOpen) {
      otherModalWasOpen = true;
      return true;
    }
    if (otherModalWasOpen) {
      otherModalClosedAt = Date.now();
      otherModalWasOpen = false;
    }
    if (otherModalClosedAt && Date.now() - otherModalClosedAt < OTHER_MODAL_GAP_MS) return true;

    return false;
  }

  function openModal() {
    if (!canShowByFrequency() || isBlocked()) return;

    opened = true;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    backdrop.inert = false;
    document.getElementById('floating-contact')?.setAttribute('hidden', '');
    lockPage();
    storageSet(sessionStorage, SESSION_KEY, '1');
    storageSet(localStorage, LAST_SHOWN_KEY, String(Date.now()));
  }

  function tryShow() {
    if (!armed || opened) return;
    if (!canShowByFrequency()) {
      armed = false;
      return;
    }
    if (isBlocked()) return;
    openModal();
  }

  function arm() {
    if (opened) return;
    armed = true;
    tryShow();
  }

  function closeModal() {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.inert = true;
    document.getElementById('floating-contact')?.removeAttribute('hidden');
    unlockPage();
    storageSet(sessionStorage, SESSION_KEY, '1');
  }

  closeBtn.addEventListener('click', closeModal, { signal });

  backdrop.addEventListener(
    'click',
    (e) => {
      if (e.target === backdrop) closeModal();
    },
    { signal }
  );

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) {
        closeModal();
      }
    },
    { signal }
  );

  if (form) {
    const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement | null;
    if (phoneInput) {
      phoneInput.addEventListener(
        'input',
        () => {
          phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 9);
        },
        { signal }
      );
    }

    form.addEventListener(
      'submit',
      async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const submitBtn = form.querySelector('[type="submit"]') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = true;
        errorEl?.classList.add('opacity-0');

        try {
          await submitLead(readLeadForm(form, 'modal'));
          markLeadSubmitted();
        } catch {
          errorEl?.classList.remove('opacity-0');
          if (submitBtn) submitBtn.disabled = false;
          return;
        }

        if (submitBtn) submitBtn.disabled = false;

        if (successScreen) {
          successScreen.classList.remove('opacity-0', 'pointer-events-none');
          successScreen.classList.add('opacity-100', 'pointer-events-auto');
          form.reset();

          window.clearTimeout(successTimer);
          successTimer = window.setTimeout(() => {
            closeModal();
            window.setTimeout(() => {
              successScreen.classList.remove('opacity-100', 'pointer-events-auto');
              successScreen.classList.add('opacity-0', 'pointer-events-none');
            }, 300);
          }, 4000);
        }
      },
      { signal }
    );
  }

  window.addEventListener(
    'hashchange',
    () => {
      if (armed) tryShow();
    },
    { signal }
  );

  document.documentElement.addEventListener(
    'mouseleave',
    (e) => {
      if (!isDesktopPointer()) return;
      if (Date.now() - startedAt < EXIT_MIN_MS) return;
      if (e.clientY > 8) return;
      arm();
    },
    { signal }
  );

  const retryTimer = window.setInterval(() => {
    if (armed) tryShow();
  }, 2000);

  return () => {
    abort.abort();
    window.clearInterval(retryTimer);
    if (successTimer) window.clearTimeout(successTimer);
    if (backdrop.classList.contains('open')) {
      document.getElementById('floating-contact')?.removeAttribute('hidden');
      unlockPage();
    }
  };
}

export function destroyContactModal() {
  cleanupModal?.();
  cleanupModal = undefined;
}

export function initContactModal() {
  destroyContactModal();
  cleanupModal = bindContactModal();
}
