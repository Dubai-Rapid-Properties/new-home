import listings from '@/data/imported/listings.json';
import { siteUrl } from '@/lib/siteUrl';

/**
 * The Property Finder listings this site shows, as JSON. The admin portal
 * (Website → Listings → Property Finder listings) reads it so staff can take a
 * listing over to edit it or hide it. Public by design: it is what the site
 * shows anyway.
 */
export const dynamic = 'force-static';

/* Cleaned photos are served from this site (/media/listings/…): give the portal full addresses it can show and keep */
const absolute = (src: string) => (src.startsWith('/') ? `${siteUrl}${src}` : src);

export function GET() {
  const body = (listings as { images: string[] }[]).map((l) => ({ ...l, images: l.images.map(absolute) }));
  return Response.json(body, { headers: { 'Access-Control-Allow-Origin': '*' } });
}
