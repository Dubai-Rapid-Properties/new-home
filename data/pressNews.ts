/**
 * Dubai property news for /news: the articles the team picks in the D|R|P
 * portal (Website -> News) and the UAE property stories from publishers'
 * public feeds, gathered before each build by scripts/sync-news.mjs. Each is
 * a headline, a short summary and a link to the article on the publisher's
 * site.
 */
import imported from './imported/news.json';

export type PressItem = {
  url: string;
  title: string;
  summary: string;
  image: string | null;
  /** ISO date */
  date: string;
  /** The publication, e.g. "Arabian Business" */
  source: string;
  /** Picked by the team in the portal, rather than from a feed */
  pick: boolean;
  /** The site's own Dubai photo for the story: shown when the publisher gives no picture or it won't load */
  photo: string;
};

/** The site's photos of the places a story may name, first match wins. */
const PLACES: [RegExp, string][] = [
  [/palm jumeirah|\bpalm\b/i, '/images/palm.jpg'],
  [/marina|\bJBR\b|jumeirah beach residence/i, '/images/marina.avif'],
  [/downtown|burj khalifa|\bburj\b/i, '/images/downtown.jpeg'],
  [/\bcreek\b/i, '/images/creek.jpg'],
  [/\bJVC\b|jumeirah village/i, '/images/jvc.jpeg'],
  [/dubai hills|\bhills\b/i, '/images/hills.webp'],
  [/business bay/i, '/images/bay.webp'],
  [/\bislands?\b/i, '/images/island.webp'],
  [/\bMBR\b|meydan|mohammed bin rashid city/i, '/images/mbr.jpg'],
  [/golden visa/i, '/images/golden.jpg'],
  [/\branches\b/i, '/images/ranches.jpg'],
  [/\bvillas?\b/i, '/images/villa.jpg'],
];
const SKYLINES = [
  '/images/market.webp',
  '/images/newproperty.webp',
  '/images/luxury.webp',
  '/images/downtown.jpeg',
  '/images/palm.jpg',
  '/images/marina.avif',
  '/images/ranches.jpg',
  '/images/property1.jpeg',
  '/images/island.webp',
  '/images/hills.webp',
];

/** The photo of the place a story names, else one of the skylines (the same one for a story every build). */
function photoFor(item: Omit<PressItem, 'photo'>): string {
  const place = PLACES.find(([re]) => re.test(item.title))?.[1];
  if (place) return place;
  let hash = 0;
  for (const ch of item.url) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SKYLINES[hash % SKYLINES.length];
}

// Read as a whole: webpack's JSON tree-shaking breaks destructuring with defaults here.
const news = imported as { picks?: Omit<PressItem, 'photo'>[]; stories?: Omit<PressItem, 'photo'>[] };

/** Newest first, the team's picks and the feed stories together. */
export const pressNews: PressItem[] = [...(news.picks ?? []), ...(news.stories ?? [])]
  .map((item) => ({ ...item, photo: photoFor(item) }))
  .sort((a, b) => b.date.localeCompare(a.date));

export const formatPressDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
