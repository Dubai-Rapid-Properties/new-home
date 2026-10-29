import { AGENT_COOKIE, AGENT_COOKIE_MAX_AGE, agentAccessConfigured, agentToken, codeMatches, isAgent } from '@/lib/agentAccess';

/** GET: whether this browser is signed in as a D|R|P agent (lib/agentAccess.ts) */
export async function GET(req: Request) {
  return Response.json({ agent: await isAgent(req) }, { headers: { 'cache-control': 'private, no-store' } });
}

const cookie = (value: string, maxAge: number) =>
  `${AGENT_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

/** POST { code }: signs the browser in with the office's access code; { signOut: true } signs it out */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { code?: unknown; signOut?: unknown };
  if (body.signOut) {
    return Response.json({ agent: false }, { headers: { 'set-cookie': cookie('', 0) } });
  }
  if (!agentAccessConfigured()) return Response.json({ agent: false, error: 'not-configured' }, { status: 503 });
  if (typeof body.code !== 'string' || !(await codeMatches(body.code))) {
    /* A pause makes guessing the code slow */
    await new Promise((r) => setTimeout(r, 800));
    return Response.json({ agent: false, error: 'wrong-code' }, { status: 401 });
  }
  return Response.json(
    { agent: true },
    { headers: { 'set-cookie': cookie(await agentToken(), AGENT_COOKIE_MAX_AGE), 'cache-control': 'private, no-store' } },
  );
}
