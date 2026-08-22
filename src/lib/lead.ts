export type LeadSource = 'contact' | 'modal' | 'audit';

export type LeadPayload = {
  source: LeadSource;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  sector?: string;
  interest?: string;
  website?: string;
  hp?: string;
};

const SOURCE_LABEL: Record<LeadSource, string> = {
  contact: 'Kontakt formasi',
  modal: 'Kontakt popup',
  audit: 'Sayt auditi',
};

const INTEREST_CATEGORY: Record<string, string> = {
  'Mobile App Development': 'A — New Product',
  'Web Development': 'A — New Product',
  'Existing Product Development': 'B — Existing Product',
  'Dedicated Mobile Team': 'D — Dedicated Team',
  'B2B Partnership': 'C — B2B Partnership',
  'Technical Consulting': 'E — Consulting',
  Other: 'F — Other',
  'Mobile product development': 'A — New Product',
  'Mobil mahsulot ishlab chiqish': 'A — New Product',
  'Разработка мобильных продуктов': 'A — New Product',
  'Mobile development partnership': 'C — B2B Partnership',
  'Mobil dasturlash hamkorligi': 'C — B2B Partnership',
  'Партнёрство в мобильной разработке': 'C — B2B Partnership',
  'Dedicated mobile team': 'D — Dedicated Team',
  'Dedicated mobil jamoa': 'D — Dedicated Team',
  'Выделенная мобильная команда': 'D — Dedicated Team',
  'Web and supporting systems': 'A — New Product',
  "Web va qo'llab-quvvatlovchi tizimlar": 'A — New Product',
  'Web и вспомогательные системы': 'A — New Product',
  'Product discovery and consulting': 'E — Consulting',
  'Mahsulot discovery va konsalting': 'E — Consulting',
  'Product discovery и консалтинг': 'E — Consulting',
  'Not sure yet': 'F — Other',
  'Hali aniq emas': 'F — Other',
  'Пока неясно': 'F — Other',
};

const MAX = {
  name: 120,
  email: 160,
  phone: 40,
  message: 4000,
  sector: 120,
  interest: 120,
  website: 200,
};

function clean(value: unknown, max: number) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function htmlRow(label: string, value: string) {
  if (!value) return '';
  return `<b>${label}:</b> ${escapeHtml(value)}`;
}

export function normalizeLead(input: LeadPayload): LeadPayload {
  return {
    source: input.source,
    name: clean(input.name, MAX.name),
    email: clean(input.email, MAX.email),
    phone: clean(input.phone, MAX.phone),
    message: clean(input.message, MAX.message),
    sector: clean(input.sector, MAX.sector),
    interest: clean(input.interest, MAX.interest),
    website: clean(input.website, MAX.website),
    hp: clean(input.hp, 80),
  };
}

export function isSpam(lead: LeadPayload) {
  return Boolean(lead.hp);
}

export function isValidLead(lead: LeadPayload) {
  if (lead.source === 'contact') {
    return Boolean(lead.name && lead.phone && lead.interest && lead.message);
  }
  if (lead.source === 'modal') {
    return Boolean(lead.name && lead.phone && lead.interest);
  }
  if (lead.source === 'audit') {
    return Boolean(lead.website && lead.phone);
  }
  return false;
}

function telegramText(lead: LeadPayload) {
  const lines = [
    `Yangi xabar — ${SOURCE_LABEL[lead.source]}`,
    '',
    htmlRow('Ism', lead.name ?? ''),
    htmlRow('Email', lead.email ?? ''),
    htmlRow('Telefon', lead.phone ?? ''),
    htmlRow('Soha', lead.sector ?? ''),
    htmlRow('Qiziqish', lead.interest ?? ''),
    htmlRow('Kategoriya', INTEREST_CATEGORY[lead.interest ?? ''] ?? ''),
    htmlRow('Sayt', lead.website ?? ''),
    lead.message ? `<b>Xabar:</b>\n${escapeHtml(lead.message)}` : '',
  ].filter(Boolean);

  return lines.join('\n').slice(0, 4000);
}

function emailFields(lead: LeadPayload) {
  const subject = `TuronCore — ${SOURCE_LABEL[lead.source]}`;
  return {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    source: SOURCE_LABEL[lead.source],
    name: lead.name || '-',
    email: lead.email || 'noreply@turoncore.uz',
    phone: lead.phone || '-',
    sector: lead.sector || '-',
    interest: lead.interest || '-',
    category: INTEREST_CATEGORY[lead.interest ?? ''] || '-',
    website: lead.website || '-',
    message: lead.message || '-',
  };
}

async function getBotId(token: string) {
  return token.split(':')[0] ?? '';
}

async function chatIdFromUpdates(token: string) {
  const botId = await getBotId(token);
  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=20`);
  const data = (await response.json()) as {
    ok: boolean;
    result?: Array<{ message?: { chat?: { id?: number; type?: string } } }>;
  };

  if (!data.ok) return '';

  for (let i = (data.result?.length ?? 0) - 1; i >= 0; i -= 1) {
    const chat = data.result?.[i]?.message?.chat;
    if (chat?.type === 'private' && chat.id && String(chat.id) !== botId) {
      return String(chat.id);
    }
  }

  return '';
}

async function resolveChatId(token: string) {
  const configured = String(import.meta.env.TELEGRAM_CHAT_ID ?? '').trim();
  const botId = await getBotId(token);

  if (configured && configured !== botId) {
    return configured;
  }

  const fromUpdates = await chatIdFromUpdates(token);
  if (fromUpdates) {
    console.info('Telegram chat id:', fromUpdates);
    return fromUpdates;
  }

  throw new Error('Telegram chat not found');
}

async function sendTelegram(lead: LeadPayload) {
  const token = String(import.meta.env.TELEGRAM_BOT_TOKEN ?? '').trim();
  if (!token) throw new Error('Telegram token missing');

  const chatId = await resolveChatId(token);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: telegramText(lead),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  const data = (await response.json()) as { ok?: boolean; description?: string };
  if (!data.ok) {
    throw new Error(data.description || 'Telegram send failed');
  }
}

async function sendEmail(lead: LeadPayload) {
  const to = String(import.meta.env.CONTACT_EMAIL ?? 'turoncore@gmail.com').trim();
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(emailFields(lead)),
  });

  if (!response.ok) {
    throw new Error('Email send failed');
  }
}

export async function deliverLead(input: LeadPayload) {
  const lead = normalizeLead(input);
  if (isSpam(lead)) return { ok: true as const, skipped: true };
  if (!isValidLead(lead)) {
    throw new Error('Invalid lead');
  }

  const results = await Promise.allSettled([sendTelegram(lead), sendEmail(lead)]);
  const telegram = results[0];
  const email = results[1];

  if (telegram.status === 'rejected') {
    console.error('Telegram send failed', telegram.reason);
    throw telegram.reason;
  }

  if (email.status === 'rejected') {
    console.error('Email send failed', email.reason);
  }

  return { ok: true as const, skipped: false };
}
