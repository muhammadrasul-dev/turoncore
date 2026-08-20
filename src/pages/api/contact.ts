import type { APIRoute } from 'astro';
import { deliverLead, type LeadPayload, type LeadSource } from '../../lib/lead';

export const prerender = false;

const SOURCES: LeadSource[] = ['contact', 'modal', 'audit'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as LeadPayload;
    if (!SOURCES.includes(body.source)) {
      return json({ ok: false }, 400);
    }

    await deliverLead(body);
    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'Invalid lead') {
      return json({ ok: false }, 400);
    }
    console.error('Contact form failed', error);
    return json({ ok: false }, 502);
  }
};
