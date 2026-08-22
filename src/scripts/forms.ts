import type { LeadPayload, LeadSource } from '../lib/lead';

const LEAD_SUBMITTED_KEY = 'tc-lead-submitted';
const MODAL_SHOWN_KEY = 'tc-modal-shown';

export function markLeadSubmitted() {
  try {
    localStorage.setItem(LEAD_SUBMITTED_KEY, '1');
    sessionStorage.setItem(MODAL_SHOWN_KEY, '1');
  } catch {
    // storage may be blocked
  }
}

export function hasSubmittedLead() {
  try {
    return localStorage.getItem(LEAD_SUBMITTED_KEY) === '1';
  } catch {
    return false;
  }
}

function readValue(form: HTMLFormElement, name: string) {
  const value = form.elements.namedItem(name);
  if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement || value instanceof HTMLSelectElement) {
    return value.value.trim();
  }
  return '';
}

function withUzPhone(phone: string) {
  const compact = phone.replace(/\s/g, '');
  if (!compact || compact.startsWith('+998') || compact.startsWith('998')) return phone;
  return `+998 ${phone}`;
}

export function readLeadForm(form: HTMLFormElement, source: LeadSource): LeadPayload {
  const lead: LeadPayload = {
    source,
    name: readValue(form, 'name'),
    email: readValue(form, 'email'),
    phone: readValue(form, 'phone'),
    message: readValue(form, 'message'),
    sector: readValue(form, 'sector'),
    interest: readValue(form, 'interest'),
    website: readValue(form, 'website'),
    hp: readValue(form, 'hp'),
  };

  if ((source === 'modal' || source === 'contact') && lead.phone) {
    lead.phone = withUzPhone(lead.phone);
  }

  return lead;
}

export async function submitLead(payload: LeadPayload) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Send failed');
  }
}

export function bindLeadForm(
  formId: string,
  source: LeadSource,
  successId: string,
  errorId: string
) {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  const successEl = document.getElementById(successId);
  const errorEl = document.getElementById(errorId);
  if (!form || form.dataset.bound === '1') return;

  form.dataset.bound = '1';
  let timer: number | undefined;

  const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement | null;
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 9);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]') as HTMLButtonElement | null;
    if (submitBtn) submitBtn.disabled = true;
    successEl?.classList.add('opacity-0');
    errorEl?.classList.add('opacity-0');

    try {
      await submitLead(readLeadForm(form, source));
      markLeadSubmitted();
      successEl?.classList.remove('opacity-0');
      form.reset();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => successEl?.classList.add('opacity-0'), 5000);
    } catch {
      errorEl?.classList.remove('opacity-0');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
