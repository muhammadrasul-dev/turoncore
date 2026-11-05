import { track } from '@vercel/analytics';

let bound = false;

// Name the outbound and contact links that can turn a visitor into a lead
function classify(href: string): string | null {
  if (href.startsWith('tel:')) return 'Phone click';
  if (href.startsWith('mailto:')) return 'Email click';
  if (href.includes('t.me/')) return 'Telegram click';
  if (href.includes('instagram.com/')) return 'Instagram click';
  if (href.includes('apps.apple.com/') || href.includes('play.google.com/')) return 'Store link click';
  if (/\/contact(?:$|[?#])|#contact$/.test(href)) return 'Contact CTA click';
  return null;
}

export function initClickTracking() {
  if (bound) return;
  bound = true;

  document.addEventListener(
    'click',
    (event) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const name = classify(anchor.getAttribute('href') ?? '');
      if (!name) return;
      track(name, { page: window.location.pathname, href: anchor.href.slice(0, 200) });
    },
    { capture: true },
  );
}
