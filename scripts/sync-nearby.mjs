#!/usr/bin/env node
/**
 * Schools, restaurants, hospitals and metro stations near each listing, from
 * OpenStreetMap (Overpass API - free, no key) into data/imported/nearby.json,
 * shown under "Location" on the listing page.
 *
 * Runs before every build (`prebuild`). Places are cached per location, so a
 * build only asks about new buildings (and refreshes old entries a few at a
 * time). The cache is also kept in .next/cache, which Vercel restores
 * between builds, so places found on one deploy are kept for the next even
 * when nearby.json in the repo is behind. Any failure keeps the cache as it is and the build carries on, and
 * the lookups stop after NEARBY_BUDGET_S seconds so a slow map server never
 * holds up a deploy.
 *
 *   npm run sync:nearby
 *   NEARBY_MAX=200 npm run sync:nearby   # fill the cache in one go
 */

import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Node's built-in fetch only honours HTTPS_PROXY when NODE_USE_ENV_PROXY is set.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const child = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(child.status ?? 1);
}

const FILE = new URL('../data/imported/nearby.json', import.meta.url);
const BUILD_CACHE = new URL('../.next/cache/drp-nearby.json', import.meta.url);
const LISTING_FILES = ['listings.json', 'portal-listings.json'].map((f) => new URL(`../data/imported/${f}`, import.meta.url));
const SERVERS = (
  process.env.NEARBY_SERVERS?.split(',') ?? [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]
).map((s) => s.trim());
/** New locations asked per build; the rest wait for the next build */
const MAX = Number(process.env.NEARBY_MAX) || 25;
/** Seconds this script may spend on lookups per build */
const BUDGET_S = Number(process.env.NEARBY_BUDGET_S) || 120;
const STALE_DAYS = 120;
const PER_CATEGORY = 6;

const log = (...a) => console.log('[nearby]', ...a);
const keyOf = ([lat, lng]) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

/** One request per location: each category within its own radius (metres) */
function query(lat, lng) {
  const at = (r) => `(around:${r},${lat},${lng})`;
  return `[out:json][timeout:40];(
    nwr${at(3000)}[amenity~"^(school|kindergarten|college|university)$"][name];
    nwr${at(900)}[amenity~"^(restaurant|cafe)$"][name];
    nwr${at(4000)}[amenity~"^(hospital|clinic)$"][name];
    nwr${at(3000)}[railway~"^(station|halt|tram_stop)$"][name];
  );out center tags 400;`;
}

function km(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** The English name, or the name if it is already in Latin letters; never Arabic script */
function englishName(tags) {
  const name = tags['name:en'] || tags.name || '';
  return /^[\p{Script=Latin}\p{N}\p{P}\p{Zs}&+'’.-]+$/u.test(name) ? name.trim() : '';
}

function category(tags) {
  if (/^(school|kindergarten|college|university)$/.test(tags.amenity ?? '')) return 'schools';
  if (/^(restaurant|cafe)$/.test(tags.amenity ?? '')) return 'restaurants';
  if (/^(hospital|clinic)$/.test(tags.amenity ?? '')) return 'hospitals';
  if (tags.railway) return 'metro';
  return null;
}

/** Servers that failed are tried last from then on. */
const servers = [...SERVERS];

async function fetchPlaces(near) {
  const body = new URLSearchParams({ data: query(near[0], near[1]) });
  let lastError;
  for (const server of [...servers]) {
    try {
      const res = await fetch(server, {
        method: 'POST',
        body,
        headers: { 'user-agent': 'DRP-website-build/1.0 (dubairapidproperties.com)' },
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const out = { schools: [], restaurants: [], hospitals: [], metro: [] };
      for (const el of json.elements ?? []) {
        const tags = el.tags ?? {};
        const cat = category(tags);
        const name = englishName(tags);
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!cat || !name || lat == null || lon == null) continue;
        out[cat].push({ name, km: Math.round(km(near, [lat, lon]) * 10) / 10 });
      }
      for (const cat of Object.keys(out)) {
        const seen = new Set();
        out[cat] = out[cat]
          .sort((a, b) => a.km - b.km)
          .filter((p) => !seen.has(p.name.toLowerCase()) && seen.add(p.name.toLowerCase()))
          .slice(0, PER_CATEGORY);
      }
      return out;
    } catch (error) {
      lastError = error;
      servers.push(...servers.splice(servers.indexOf(server), 1));
    }
  }
  throw lastError;
}

const readJson = async (file) => {
  try {
    const value = JSON.parse(await readFile(file, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
};

/* The repo's copy and the build cache's, the newer entry winning */
const cache = await readJson(FILE);
for (const [key, entry] of Object.entries(await readJson(BUILD_CACHE))) {
  if (!cache[key] || Date.parse(entry.fetchedAt) > Date.parse(cache[key].fetchedAt)) cache[key] = entry;
}
const wanted = new Map();
for (const file of LISTING_FILES) {
  const list = JSON.parse(await readFile(file, 'utf8').catch(() => '[]'));
  for (const l of Array.isArray(list) ? list : []) {
    const near = l?.map?.near;
    if (Array.isArray(near) && near.length === 2 && near.every(Number.isFinite)) wanted.set(keyOf(near), near);
  }
}

const now = Date.now();
const todo = [...wanted]
  .filter(([key]) => !cache[key] || now - Date.parse(cache[key].fetchedAt) > STALE_DAYS * 864e5)
  .sort(([a], [b]) => Number(Boolean(cache[a])) - Number(Boolean(cache[b])))
  .slice(0, MAX);

const save = async () => {
  const json = `${JSON.stringify(Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b))), null, 1)}\n`;
  await writeFile(FILE, json);
  await mkdir(new URL('.', BUILD_CACHE), { recursive: true });
  await writeFile(BUILD_CACHE, json);
};

const deadline = Date.now() + BUDGET_S * 1000;
let fetched = 0;
let failures = 0;
for (const [key, near] of todo) {
  if (Date.now() > deadline) {
    log(`Out of time; the rest wait for the next build.`);
    break;
  }
  try {
    cache[key] = { fetchedAt: new Date().toISOString(), ...(await fetchPlaces(near)) };
    fetched++;
    /* Saved as it goes, so an interrupted run keeps what it found */
    if (fetched % 5 === 0) await save();
  } catch (error) {
    log(`Skipping ${key} (${error.message}); trying again next build.`);
    /* Every server down: no point asking about the other locations */
    if (++failures >= 3 && !fetched) break;
  }
  await new Promise((r) => setTimeout(r, 1000));
}

/* Also when nothing new was found: puts the build cache's places into nearby.json */
if (fetched || Object.keys(cache).length) await save();
log(`${wanted.size} listing locations; ${fetched} looked up now; ${Object.keys(cache).length} cached.`);
