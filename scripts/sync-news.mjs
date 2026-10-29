#!/usr/bin/env node
/**
 * Gathers Dubai property news for /news into data/imported/news.json before
 * every build (npm "prebuild"; the hourly rebuild check runs it too):
 *
 *   - the articles the team picks in the D|R|P portal (Website -> News): any
 *     publication, e.g. Arabian Business, Lovin Dubai, DXB Interact;
 *   - the UAE property stories from publishers' own public RSS feeds:
 *     Forbes Middle East (its Real Estate section) and The National (Property).
 *
 * The site shows each as a headline, a short summary and a link to the
 * article on the publisher's site; it never copies articles. Publications
 * that refuse automated readers (Arabian Business, Lovin Dubai and others
 * answer 403) are only shown when the team adds an article by hand.
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
/** Feed stories older than this drop off; the team's picks stay until removed in the portal. */
const KEEP_DAYS = 60;
const MAX_FEED_ITEMS = 40;

/** Publishers' public RSS feeds, and which of their stories are about UAE property. */
const FEEDS = [
  {
    source: 'Forbes Middle East',
    url: 'https://www.forbesmiddleeast.com/feed',
    // Its Real Estate section covers the whole region: keep the UAE stories.
    keep: (item) => /\/industry\/real-estate\//.test(item.url) && isUae(`${item.title} ${item.summary}`),
  },
  {
    source: 'The National',
    url: 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/business/property/?outputType=xml',
    keep: () => true,
  },
];

const UAE =
  /\b(Dubai|UAE|U\.A\.E|Emirat\w*|Abu Dhabi|Sharjah|Ajman|Ras Al Khaimah|RAK|Emaar|Aldar|Nakheel|Damac|Sobha|Meraas|Dubai Holding|Binghatti|Azizi|Ellington|Omniyat|Palm Jumeirah|DLD)\b/i;
const isUae = (text) => UAE.test(text);

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
    try {
      const xml = await (await download(feed.url, 'application/rss+xml, application/xml, text/xml')).text();
      const items = parseFeed(xml).filter(feed.keep).map((i) => ({ ...i, source: feed.source, pick: false }));
      console.log(`[news] ${feed.source}: ${items.length} UAE property stories.`);
      fromFeeds.push(...items, ...kept(false, feed.source));
    } catch (err) {
      console.warn(`[news] ${feed.source} could not be read (${err.message}); keeping its stories from the last build.`);
      fromFeeds.push(...kept(false, feed.source));
    }
  }

  const seen = new Set(picks.map((p) => p.url));
  const stories = fromFeeds
    .filter((n) => n.date && n.date >= cutoff && !seen.has(n.url) && seen.add(n.url))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_FEED_ITEMS);
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
