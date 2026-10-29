/**
 * Agents-only tools (the off-plan brochure). An agent enters the office's
 * access code once at /agents; the browser then keeps a signed, httpOnly
 * cookie for 90 days. The code is the AGENT_ACCESS_CODE secret on the
 * Worker: change it and every cookie stops working. Without the secret the
 * tools stay locked for everyone.
 */
export const AGENT_COOKIE = 'drp_agent';
export const AGENT_COOKIE_MAX_AGE = 90 * 24 * 60 * 60;

const code = () => process.env.AGENT_ACCESS_CODE?.trim() || '';

export const agentAccessConfigured = () => code().length > 0;

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/** The cookie's value: an HMAC of a fixed label, keyed with the access code */
export async function agentToken(): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(code()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('drp-agent-tools-v1')));
}

/** Compares without stopping at the first difference */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function codeMatches(attempt: string) {
  return agentAccessConfigured() && same(attempt.trim(), code());
}

/** Whether the request carries a valid agent cookie */
export async function isAgent(req: Request) {
  if (!agentAccessConfigured()) return false;
  const cookie = req.headers.get('cookie') ?? '';
  const value = cookie
    .split(/;\s*/)
    .find((c) => c.startsWith(`${AGENT_COOKIE}=`))
    ?.slice(AGENT_COOKIE.length + 1);
  return Boolean(value) && same(value!, await agentToken());
}
