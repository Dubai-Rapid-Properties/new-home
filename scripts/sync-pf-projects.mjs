#!/usr/bin/env node
/**
 * Every off-plan project in Dubai, from Property Finder's New Projects pages
 * (propertyfinder.ae/en/new-projects), into data/market/pf-projects.json.
 * data/offPlan.ts adds the ones D|R|P has not listed itself to the site.
 *
 *   npm run sync:pf-projects            refresh (details older than six days)
 *   npm run sync:pf-projects -- --all   refetch every project's details
 *
 * Reads the public pages, as a visitor's browser would: first the listing
 * (about 125 pages, 24 projects each), then each Dubai project's own page for
 * its description, photos, unit types and payment plan. Takes 10-20 minutes,
 * so it runs weekly (.github/workflows/sync-pf-projects.yml) or by hand, not
 * before every build.
 *
 * Safe by design: if Property Finder fails or returns too few projects, the
 * current file is kept.
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

const ORIGIN = 'https://www.propertyfinder.ae';
const OUT = new URL('../data/market/pf-projects.json', import.meta.url);
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
/* Every project's page is reread on each weekly run: its construction progress and inspection date are only there */
const REFRESH_AFTER_MS = 6 * 24 * 3600_000;
const CONCURRENCY = 4;
/* A run that finds fewer than this many keeps the current file */
const MIN_PROJECTS = 500;
const ALL = process.argv.includes('--all');

const log = (...a) => console.log('[pf-projects]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function nextData(path) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(ORIGIN + path, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
      if (!json) throw new Error('no page data');
      return JSON.parse(json).props.pageProps;
    } catch (err) {
      if (attempt >= 4) throw new Error(`${path}: ${err.message}`);
      await sleep(2000 * attempt);
    }
  }
}

/* ---------- Text helpers ---------- */

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, '’')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

/** Up to `max` characters, ending on a full sentence where there is one. */
function clip(text, max = 450) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = cut.lastIndexOf('. ');
  return end > max / 2 ? cut.slice(0, end + 1) : `${cut.replace(/\s+\S*$/, '')}…`;
}

/** The description's first two paragraphs as plain text: no headings, lists or empty lines. */
function paragraphs(html) {
  return [...(html ?? '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => decode(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim())
    .filter((t) => t.length >= 60 && !/:$/.test(t))
    .slice(0, 2)
    .map((t) => clip(t));
}

/** "70/30": paid before handover / on and after handover, from the first plan. */
function paymentPlan(plans) {
  const phases = plans?.[0]?.phases;
  if (!phases?.length) return null;
  const total = phases.reduce((n, p) => n + (Number(p.value) || 0), 0);
  if (total < 95 || total > 105) return null;
  const after = phases
    .filter((p) => /handover/.test(p.label))
    .reduce((n, p) => n + (Number(p.value) || 0), 0);
  const before = Math.round(total - after);
  return `${before}/${Math.round(after)}`;
}

const bedroomsOf = (units, listed) => {
  const fromUnits = (units ?? []).flatMap((g) => (g.units ?? []).flatMap((u) => (u.list ?? []).map((l) => l.bedrooms)));
  const all = [...fromUnits, ...(listed ?? []).map(Number)].filter((n) => Number.isInteger(n) && n >= 0 && n <= 12);
  return [...new Set(all)].sort((a, b) => a - b);
};

const typesOf = (types) => [...new Set((types ?? []).map((t) => String(t).toLowerCase()))];

/**
 * Photos are kept as just their file key: the rest of the address is the same
 * for every photo of a project (data/offPlan.ts puts it back), and the file is
 * bundled into the site's server code, which has a size limit.
 */
const shortImage = (id, url) =>
  url.match(new RegExp(`^https://new-projects-media\\.propertyfinder\\.com/project/${id}/gallery/image/([^/]+)/medium\\.webp$`))?.[1] ?? url;

/* ---------- Listing ---------- */

async function listing() {
  const found = new Map();
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const props = await nextData(`/en/new-projects?page=${page}`);
    const result = props?.searchResult;
    if (!result) break;
    pages = result.meta?.pagination?.total ?? pages;
    for (const p of result.data?.projects ?? []) {
      const city = (p.location?.fullName ?? '').split(',')[0];
      if (city !== 'Dubai' || !p.shareUrl) continue;
      found.set(p.shareUrl, p);
    }
    if (page % 20 === 0) log(`listing page ${page}/${pages}: ${found.size} Dubai projects`);
    await sleep(500);
  }
  return [...found.values()];
}

/* ---------- One project ---------- */

function record(item, detail) {
  const d = detail ?? {};
  const tree = d.locationTree ?? [];
  const community = tree.find((l) => l.type === 'COMMUNITY')?.name ?? (item.location?.fullName ?? '').split(',')[1] ?? null;
  const subCommunity = tree.find((l) => l.type === 'SUBCOMMUNITY')?.name ?? null;
  const coords = d.location?.coordinates ?? item.location?.coordinates;
  const images = (d.images ?? item.images ?? [])
    .filter((i) => i.type === 'image')
    .map((i) => i.variants?.medium ?? i.source)
    .filter(Boolean)
    .slice(0, 8)
    .map((url) => shortImage(item.id, url));
  return {
    id: item.id,
    path: item.shareUrl.replace('/en/new-projects/', ''),
    name: (d.title ?? item.title ?? '').trim(),
    developer: (d.developer ?? item.developer)?.name ?? null,
    community,
    subCommunity,
    lat: coords?.lat ?? null,
    lng: coords?.lon ?? coords?.lng ?? null,
    phase: d.constructionPhase ?? item.constructionPhase ?? null,
    progress: d.constructionProgress != null && d.constructionProgress !== '' ? Number(d.constructionProgress) : null,
    inspected: d.lastInspectionDate?.slice(0, 10) ?? null,
    startingPrice: d.startingPrice ?? item.startingPrice ?? null,
    deliveryDate: (d.deliveryDate ?? item.deliveryDate)?.slice(0, 10) ?? null,
    salesStart: (d.salesStartDate ?? item.salesStartDate)?.slice(0, 10) ?? null,
    propertyTypes: typesOf(d.propertyTypes ?? item.propertyTypes),
    bedrooms: bedroomsOf(d.units, item.bedrooms),
    paymentPlan: paymentPlan(d.paymentPlans ?? item.paymentPlans),
    description: paragraphs(d.description),
    amenities: (d.amenities ?? item.amenities ?? []).map((a) => a.name).filter(Boolean).slice(0, 12),
    images,
    fetched: detail ? new Date().toISOString().slice(0, 10) : null,
  };
}

async function main() {
  let current = { projects: [] };
  try {
    current = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    /* first run */
  }
  const known = new Map(current.projects.map((p) => [p.id, p]));

  const items = await listing();
  /* Off-plan only: projects already built are not sold off-plan */
  const offPlan = items.filter((p) => p.constructionPhase !== 'completed');
  log(`${items.length} Dubai projects listed, ${offPlan.length} off-plan`);
  if (offPlan.length < MIN_PROJECTS) {
    log(`only ${offPlan.length} found; keeping the current file`);
    return;
  }

  const fresh = (p) =>
    !ALL && p?.fetched && Date.now() - new Date(p.fetched).getTime() < REFRESH_AFTER_MS && p.description.length;
  const out = new Array(offPlan.length);
  let next = 0;
  let fetched = 0;
  let failed = 0;
  async function worker() {
    while (next < offPlan.length) {
      const i = next++;
      const item = offPlan[i];
      const before = known.get(item.id);
      if (fresh(before)) {
        /* Keep the details; take the listing's current price, date and phase */
        out[i] = { ...before, ...pick(record(item, null)) };
        continue;
      }
      try {
        const props = await nextData(item.shareUrl);
        out[i] = record(item, props?.detailResult ?? null);
        fetched++;
      } catch (err) {
        failed++;
        out[i] = before ?? record(item, null);
        log(`kept old details: ${err.message}`);
      }
      if ((fetched + failed) % 100 === 0) log(`details ${fetched + failed}…`);
      await sleep(300);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const projects = out.filter((p) => p?.name).sort((a, b) => a.path.localeCompare(b.path));
  await writeFile(OUT, serialise(new Date().toISOString().slice(0, 10), projects));
  log(`wrote ${projects.length} projects (${fetched} pages read, ${failed} failed)`);
}

/** One project per line, so a refresh shows as a readable diff */
const serialise = (synced, projects) =>
  `{"note":${JSON.stringify(NOTE)},"synced":"${synced}","projects":[\n${projects.map((p) => JSON.stringify(p)).join(',\n')}\n]}\n`;

const NOTE =
  "Dubai off-plan projects from Property Finder's New Projects pages (scripts/sync-pf-projects.mjs). Prices, dates and payment plans are the developers' published figures; confirm before quoting. Photos are file keys under new-projects-media.propertyfinder.com/project/<id>/gallery/image/.";

/** Listing fields that change often, laid over details kept from an earlier run. */
const pick = (r) =>
  Object.fromEntries(
    Object.entries({ phase: r.phase, startingPrice: r.startingPrice, deliveryDate: r.deliveryDate, developer: r.developer }).filter(
      ([, v]) => v != null,
    ),
  );

main().catch((err) => {
  console.error('[pf-projects] failed, current file kept:', err.message);
  process.exitCode = 0;
});
