#!/usr/bin/env node
/**
 * Gathers Dubai property news for /news into data/imported/news.json before
 * every build (npm "prebuild"; the hourly rebuild check runs it too):
 *
 *   - the articles the team picks in the D|R|P portal (Website -> News): any
 *     publication, e.g. Arabian Business, Lovin Dubai, DXB Interact;
 *   - the UAE property stories from publishers' own public RSS feeds:
 *     PropertyNews.ae (its recent pages too), Forbes Middle East (its Real
 *     Estate section), The National (Property and Business), Khaleej Times
 *     and Gulf News.
 *
 * Every story has a picture: the feed's, else the one the article page gives
 * for sharing (og:image, read once and kept), else the site's own Dubai
 * photo for the place it names (data/pressNews.ts).
 *
 * The site shows each as a headline, a short summary and a link to the
 * article on the publisher's site; it never copies articles. Publications
 * that refuse automated readers are only shown when the team adds an article
 * by hand: Arabian Business and Lovin Dubai answer 403, and DXB Interact's
 * robots.txt admits search engines only.
 *
 *   NEWS_FEED_URL=https://admin.dubairapidproperties.com/api/public/news   (default)
 *
 * Safe by default: a source that cannot be reached keeps what the file had
 * from it, and the build goes on.
 */

import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

// Node's built-in fetch only honours HTTPS_PROXY when NODE_USE_ENV_PROXY is set.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const child = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(child.status ?? 1);
}

const PORTAL_NEWS = process.env.NEWS_FEED_URL?.trim() || 'https://admin.dubairapidproperties.com/api/public/news';
const FILE = new URL('../data/imported/news.json', import.meta.url);
const AGENT = 'DRP-website-build/1.0 (+https://dubairapidproperties.com)';
/** Feed stories older than this drop off (feeds only hold recent ones, so the list grows from build to build). */
const KEEP_DAYS = 365;
const MAX_FEED_ITEMS = 160;
/** Article pages read per build for a story's picture; the rest wait for the next build. */
const MAX_IMAGE_LOOKUPS = 150;

const UAE =
  /\b(Dubai|UAE|U\.A\.E|Emirat\w*|Abu Dhabi|Sharjah|Ajman|Ras Al Khaimah|RAK|Emaar|Aldar|Nakheel|Damac|Sobha|Meraas|Dubai Holding|Binghatti|Azizi|Ellington|Omniyat|Palm Jumeirah|DLD)\b/i;
const isUae = (text) => UAE.test(text);
// A property word, not just a developer's name: Emaar also sponsors padel.
const PROPERTY =
  /\b(real estate|property|properties|realty|off-plan|villas?|apartments?|homes? prices?|house prices|rents?|rental|mortgages?|landlords?|tenants?|housing|freehold|Dubai Land Department|RERA|Golden Visa)\b/i;
const isUaeProperty = (item) => isUae(`${item.title} ${item.summary} ${item.url}`) && PROPERTY.test(`${item.title} ${item.summary}`);

/** Publishers' public RSS feeds, and which of their stories are about UAE property. */
const FEEDS = [
  {
    source: 'PropertyNews.ae',
    // A UAE property site (WordPress): its feed's recent pages too, ten stories each.
    url: Array.from({ length: 12 }, (_, i) => `https://www.propertynews.ae/feed/${i ? `?paged=${i + 1}` : ''}`),
    keep: (item) => /propertynews\.ae\/uae\//.test(item.url),
  },
  {
    source: 'Forbes Middle East',
    url: ['https://www.forbesmiddleeast.com/feed'],
    // Its Real Estate section covers the whole region: keep the UAE stories.
    keep: (item) => /\/industry\/real-estate\//.test(item.url) && isUae(`${item.title} ${item.summary}`),
  },
  {
    source: 'The National',
    url: [
      'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/business/property/?outputType=xml',
      'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/business/?outputType=xml',
    ],
    keep: (item) => /\/business\/property\//.test(item.url) || isUaeProperty(item),
  },
  {
    source: 'Khaleej Times',
    url: ['https://www.khaleejtimes.com/stories.rss'],
    keep: isUaeProperty,
  },
  {
    source: 'Gulf News',
    url: ['https://gulfnews.com/stories.rss'],
    keep: isUaeProperty,
  },
];

/**
 * Publishers whose feed carries few stories: their Property section's articles from the daily
 * sitemaps they publish for readers' tools, each read once from its page's sharing details.
 */
const SITEMAPS = [
  {
    source: 'Gulf News',
    days: 45,
    sitemap: (day) => `https://gulfnews.com/sitemap/sitemap-daily-${day}.xml`,
    section: /^https:\/\/gulfnews\.com\/business\/property\//,
    keep: (item) => /^https:\/\/gulfnews\.com\/business\/property\//.test(item.url) && isUae(`${item.title} ${item.summary}`),
  },
];
/** Article pages read per build for a sitemap's stories; the rest wait for the next build. */
const MAX_PAGE_READS = 60;

/** What an article page gives for sharing (og: tags), or null: read once, saying who is asking. */
async function articlePage(url) {
  try {
    const res = await fetch(url, { headers: { accept: 'text/html', 'user-agent': AGENT }, signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return null;
    const head = (await res.text()).slice(0, 200_000);
    const meta = (...names) => {
      for (const name of names) {
        const tag = head.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*>`, 'i'))?.[0];
        const content = tag?.match(/content=["']([^"']+)["']/i)?.[1];
        if (content?.trim()) return text(content);
      }
      return null;
    };
    let image = meta('og:image', 'twitter:image');
    image = image ? new URL(image, url).toString() : null;
    // A publication's stock picture (its logo, a default) is no better than ours.
    if (image && (!/^https:\/\//.test(image) || /seo-image|default|placeholder|logo|favicon/i.test(image))) image = null;
    return {
      title: meta('og:title', 'twitter:title'),
      summary: summarize(meta('og:description', 'twitter:description', 'description') ?? ''),
      image,
      date: isoDate(meta('article:published_time', 'og:published_time') ?? head.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1]),
    };
  } catch {
    return null;
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
/** Text of an RSS field: CDATA unwrapped, tags removed, entities (also double-encoded ones) decoded. */
function text(raw = '') {
  let s = raw.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1');
  for (let i = 0; i < 2; i++) {
    s = s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (all, e) => {
      if (e[0] === '#') {
        const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1));
        return Number.isFinite(code) ? String.fromCodePoint(code) : all;
      }
      return ENTITIES[e.toLowerCase()] ?? all;
    });
  }
  return s
    .replace(/<\/?(p|br|div|li|h\d)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

const field = (item, name) => item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))?.[1];

/** A short summary: the start of the article, cut at a word, never the article itself. */
function summarize(s, max = 220) {
  if (s.length <= max) return s;
  return `${s.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function isoDate(value) {
  const t = Date.parse(value ?? '');
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : null;
}

/** RSS 2.0 items as { url, title, summary, image, date }. */
export function parseFeed(xml) {
  const items = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const url = text(field(item, 'link'));
    const title = text(field(item, 'title'));
    if (!/^https:\/\//.test(url) || !title) continue;
    // The description, else the first paragraph of the article.
    const lead = text(field(item, 'description')) || text(field(item, 'content:encoded')?.match(/<p>([\s\S]*?)<\/p>/)?.[1]);
    const image = item.match(/<media:content[^>]*\burl="([^"]+)"/)?.[1] ?? item.match(/<enclosure[^>]*\burl="([^"]+)"[^>]*type="image/)?.[1];
    items.push({
      url,
      title,
      summary: summarize(lead),
      image: image && /^https:\/\//.test(text(image)) ? text(image) : null,
      date: isoDate(text(field(item, 'pubDate'))),
    });
  }
  return items;
}

async function download(url, accept) {
  const res = await fetch(url, { headers: { accept, 'user-agent': AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

async function main() {
  const before = JSON.parse(await readFile(FILE, 'utf8').catch(() => '{}'));
  const kept = (pick, source) =>
    ((pick ? before.picks : before.stories) ?? []).filter((n) => source === undefined || n.source === source);
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);

  // The team's picks, as the portal lists them now.
  let picks;
  try {
    const rows = await (await download(PORTAL_NEWS, 'application/json')).json();
    if (!Array.isArray(rows)) throw new Error('not a list');
    picks = rows
      .filter((r) => r && /^https:\/\//.test(r.url) && r.title && r.source)
      .map((r) => ({
        url: r.url,
        title: String(r.title),
        summary: r.summary ? summarize(String(r.summary)) : '',
        image: r.image && /^https:\/\//.test(r.image) ? r.image : null,
        date: isoDate(r.date) ?? new Date().toISOString().slice(0, 10),
        source: String(r.source),
        pick: true,
      }));
  } catch (err) {
    console.warn(`[news] the portal's picks could not be read (${err.message}); keeping the ones in the file.`);
    picks = kept(true);
  }

  // Publishers' feeds; one that can't be read keeps its stories from the last build.
  const fromFeeds = [];
  for (const feed of FEEDS) {
    const items = [];
    for (const url of feed.url) {
      try {
        const xml = await (await download(url, 'application/rss+xml, application/xml, text/xml')).text();
        items.push(...parseFeed(xml).filter(feed.keep).map((i) => ({ ...i, source: feed.source, pick: false })));
      } catch (err) {
        console.warn(`[news] ${feed.source} (${url}) could not be read (${err.message}).`);
      }
    }
    console.log(`[news] ${feed.source}: ${items.length} UAE property stories.`);
    fromFeeds.push(...items);
  }

  // Sitemaps: new Property articles, each read once (the ones already in the file are kept as they are).
  const inFile = new Set((before.stories ?? []).map((n) => n.url));
  for (const site of SITEMAPS) {
    // Each link with the day of the sitemap that lists it (the oldest, when several do).
    const links = new Map();
    for (let d = 0; d < site.days; d++) {
      const day = new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
      try {
        const xml = await (await download(site.sitemap(day), 'application/xml, text/xml')).text();
        for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) if (site.section.test(text(loc))) links.set(text(loc), day);
      } catch (err) {
        if (d === 0) console.warn(`[news] ${site.source} (${site.sitemap(day)}) could not be read (${err.message}).`);
      }
    }
    const fresh = [...links.keys()].filter((url) => !inFile.has(url)).slice(0, MAX_PAGE_READS);
    const items = [];
    for (let i = 0; i < fresh.length; i += 6) {
      const pages = await Promise.all(fresh.slice(i, i + 6).map(articlePage));
      pages.forEach((page, j) => {
        const url = fresh[i + j];
        if (page?.title) items.push({ url, ...page, date: page.date ?? links.get(url), source: site.source, pick: false });
      });
    }
    const kept = items.filter(site.keep);
    console.log(`[news] ${site.source}: ${links.size} Property articles listed, ${fresh.length} new read, ${kept.length} about the UAE.`);
    fromFeeds.push(...kept);
  }

  // What earlier builds found, still checked against today's rules.
  const sources = [...FEEDS, ...SITEMAPS];
  fromFeeds.push(...kept(false).filter((n) => sources.some((f) => f.source === n.source && f.keep(n))));

  const seen = new Set(picks.map((p) => p.url));
  const stories = fromFeeds
    .filter((n) => n.date && n.date >= cutoff && !seen.has(n.url) && seen.add(n.url))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_FEED_ITEMS);

  // Pictures: the one found by an earlier build, else the article page's (a few at a time).
  const known = new Map([...(before.picks ?? []), ...(before.stories ?? [])].filter((n) => n.image).map((n) => [n.url, n.image]));
  const missing = [...picks, ...stories].filter((n) => !n.image && !(n.image = known.get(n.url) ?? null)).slice(0, MAX_IMAGE_LOOKUPS);
  for (let i = 0; i < missing.length; i += 6) {
    await Promise.all(missing.slice(i, i + 6).map(async (n) => (n.image = (await articlePage(n.url))?.image ?? null)));
  }
  const found = missing.filter((n) => n.image).length;
  if (missing.length) console.log(`[news] pictures read from ${found} of ${missing.length} article pages; the rest use the site's own photos.`);
  // Apart, so the hourly rebuild check fingerprints the team's picks only: a new pick rebuilds the
  // site at once, while new feed stories come with the next build (at least daily).
  await writeFile(FILE, `${JSON.stringify({ picks, stories }, null, 2)}\n`);
  console.log(`[news] ${picks.length} picked by the team, ${stories.length} from publishers' feeds.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.warn(`[news] ${err.message}; the build goes on with data/imported/news.json as it is.`);
  });
}
