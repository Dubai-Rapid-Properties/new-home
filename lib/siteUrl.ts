/**
 * The site's public address, for the sitemap, robots.txt and share links.
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the production domain — the
 * custom domain once one is added, *.vercel.app until then.
 * NEXT_PUBLIC_SITE_URL overrides it, and must be set on Cloudflare.
 */
const host =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'http://localhost:3000';

/** "example.com" is taken as https://example.com; anything unusable falls back to localhost (never indexed). */
function normalise(value: string): string {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export const siteUrl = normalise(host);

/** Search engines index the site only on its real domain, never on *.vercel.app, *.workers.dev or previews. */
export const indexable =
  !/(^|\.)(vercel\.app|workers\.dev)$|localhost/.test(new URL(siteUrl).hostname) &&
  (process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : true);
