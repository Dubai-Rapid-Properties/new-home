/**
 * GET /api/brochure-image?src=<photo address>
 *
 * Hands an off-plan project's photo to the brochure maker in the visitor's
 * browser (components/offplan/BrochureButton.tsx). Property Finder's photo
 * server sends no CORS header, so a page cannot read its photos into a PDF
 * directly; this passes them through from the site's own address. Only that
 * photo server is allowed, so the route cannot fetch anything else.
 */
const ALLOWED_HOSTS = new Set(['new-projects-media.propertyfinder.com']);
const MAX_BYTES = 8 * 1024 * 1024;

export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get('src') ?? '';
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response('Bad photo address', { status: 400 });
  }
  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
    return new Response('Photo not allowed', { status: 400 });
  }

  const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15_000) }).catch(() => null);
  const type = res?.headers.get('content-type') ?? '';
  if (!res?.ok || !type.startsWith('image/')) return new Response('Photo unavailable', { status: 502 });
  const body = await res.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return new Response('Photo too large', { status: 502 });

  return new Response(body, {
    headers: { 'content-type': type, 'cache-control': 'public, max-age=86400, s-maxage=604800' },
  });
}
