/**
 * The site's public address, for the sitemap, robots.txt and share links.
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the production domain — the
 * custom domain once one is added, *.vercel.app until then.
 * NEXT_PUBLIC_SITE_URL overrides it, and must be set on Cloudflare.
 */
const host =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'http://localhost:3000';

export const siteUrl = host.replace(/\/$/, '');

/** Search engines index the site only on its real domain, never on *.vercel.app, *.workers.dev or previews. */
export const indexable =
  !/\.vercel\.app$|\.workers\.dev$|localhost/.test(new URL(siteUrl).hostname) &&
  (process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : true);
