/**
 * Cloudflare Turnstile, the free CAPTCHA that keeps bots out of the forms.
 * It stays off until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set at build time, and
 * the server only checks the answer once TURNSTILE_SECRET_KEY is set (see
 * app/api/enquiry/route.ts). Most visitors never see a thing: the check runs
 * in the background when they press send, and a puzzle appears only for
 * visitors Cloudflare is unsure about.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
/** Long enough for a visitor to solve a puzzle */
const TIMEOUT = 60_000;

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

let loading: Promise<Turnstile | null> | undefined;

function load(): Promise<Turnstile | null> {
  const ready = () => (window as unknown as { turnstile?: Turnstile }).turnstile ?? null;
  loading ??= new Promise((resolve) => {
    if (ready()) return resolve(ready());
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve(ready());
    script.onerror = () => {
      loading = undefined;
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** A fresh token for one submission, or null when the check is off or could not run. */
export async function turnstileToken(): Promise<string | null> {
  if (!SITE_KEY || typeof window === 'undefined') return null;
  const turnstile = await load();
  if (!turnstile) return null;

  return new Promise((resolve) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    let id: string | undefined;
    const done = (token: string | null) => {
      window.clearTimeout(timer);
      if (id) turnstile.remove(id);
      host.remove();
      resolve(token);
    };
    const timer = window.setTimeout(() => done(null), TIMEOUT);
    id = turnstile.render(host, {
      sitekey: SITE_KEY,
      /* Invisible unless Cloudflare wants a puzzle solved */
      appearance: 'interaction-only',
      callback: (token: string) => done(token),
      'error-callback': () => done(null),
      'timeout-callback': () => done(null),
    });
  });
}
