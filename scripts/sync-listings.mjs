#!/usr/bin/env node
/**
 * Pulls the listings added in the D|R|P admin portal (Website -> Listings)
 * into data/imported/portal-listings.json before every build (npm
 * "prebuild", after the Property Finder sync).
 *
 *   LISTINGS_FEED_URL=https://admin.dubairapidproperties.com/api/public/listings npm run build
 *
 * The site shows these next to the Property Finder listings (listings.json);
 * a portal listing with the same web address replaces the Property Finder one
 * (data/properties.ts). The portal starts a rebuild of this site whenever a
 * published listing changes.
 *
 * Safe by default: without LISTINGS_FEED_URL, or when the portal cannot be
 * reached, the file in the repository is kept and the build goes on. Set
 * LISTINGS_FEED_REQUIRED=1 to fail the build instead. An empty list is valid:
 * the portal simply has no listings on the website.
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

const FEED = process.env.LISTINGS_FEED_URL?.trim();
const REQUIRED = process.env.LISTINGS_FEED_REQUIRED === '1';
const FILE = new URL('../data/imported/portal-listings.json', import.meta.url);
const HIDDEN_FILE = new URL('../data/imported/hidden-listings.json', import.meta.url);

function keep(reason) {
  const message = `[listings] ${reason} Keeping data/imported/portal-listings.json as it is.`;
  if (REQUIRED) {
    console.error(message.replace('Keeping', 'LISTINGS_FEED_REQUIRED is set; not keeping'));
    process.exit(1);
  }
  console.warn(message);
  process.exit(0);
}

if (!FEED) keep('LISTINGS_FEED_URL is not set.');
if (!/^https?:\/\//.test(FEED)) keep(`LISTINGS_FEED_URL is not a web address: ${FEED}`);

async function download(url, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'DRP-website-build/1.0' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt >= tries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const isTextOrNull = (v) => v === null || typeof v === 'string';
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isTextList = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** Exactly the fields data/properties.ts reads, with the types it expects. */
function problem(l) {
  if (!l || typeof l !== 'object') return 'not an object';
  if (!isText(l.slug) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.slug)) return 'bad slug';
  if (!isText(l.title)) return 'no title';
  if (l.offering !== 'buy' && l.offering !== 'rent') return 'bad offering';
  for (const k of ['price', 'beds', 'baths', 'size']) if (!isNumber(l[k])) return `bad ${k}`;
  for (const k of ['ref', 'type', 'area', 'completion', 'listedAt']) if (!isText(l[k])) return `no ${k}`;
  for (const k of ['permit', 'building', 'furnishing', 'agent']) if (!isTextOrNull(l[k])) return `bad ${k}`;
  if (typeof l.sourceUrl !== 'string') return 'bad sourceUrl';
  if (!isTextList(l.images) || l.images.length === 0) return 'no photos';
  if (!isTextList(l.description) || !isTextList(l.features)) return 'bad description or features';
  if (!l.map || !isText(l.map.query) || typeof l.map.exact !== 'boolean') return 'bad map';
  return null;
}

let feed;
try {
  feed = await download(FEED);
} catch (err) {
  keep(`Could not read ${FEED} (${err.message}).`);
}
if (!Array.isArray(feed)) keep('The portal did not return a list of listings.');

const listings = [];
for (const l of feed) {
  const why = problem(l);
  if (why) console.warn(`[listings] Skipping ${l?.slug ?? 'a listing'}: ${why}.`);
  else listings.push(l);
}
if (listings.length === 0 && feed.length > 0) keep('The portal returned no usable listings.');

const next = `${JSON.stringify(listings, null, 1)}\n`;
const current = await readFile(FILE, 'utf8').catch(() => '');
if (next === current) {
  console.log(`[listings] ${listings.length} listings from the portal; no changes.`);
} else {
  await writeFile(FILE, next);
  console.log(`[listings] ${listings.length} listings from the portal written to data/imported/portal-listings.json.`);
}

/*
 * Property Finder listings staff have hidden in the portal: their web
 * addresses, which data/properties.ts leaves off the site. A failure here
 * keeps the file as it is.
 */
try {
  const hidden = await download(`${FEED.replace(/\/$/, '')}/hidden`);
  if (Array.isArray(hidden) && hidden.every((s) => typeof s === 'string')) {
    const nextHidden = `${JSON.stringify(hidden, null, 1)}\n`;
    const currentHidden = await readFile(HIDDEN_FILE, 'utf8').catch(() => '');
    if (nextHidden !== currentHidden) await writeFile(HIDDEN_FILE, nextHidden);
    console.log(`[listings] ${hidden.length} Property Finder listings hidden in the portal.`);
  }
} catch (err) {
  console.warn(`[listings] Could not read the hidden listings (${err.message}); keeping the current list.`);
}

/*
 * The team staff keep in the portal (Website → Team): the About page and the
 * agent card on listings. data/company.ts uses it once it has anyone in it,
 * and its own built-in team until then. A failure keeps the file as it is.
 */
const TEAM_FILE = new URL('../data/imported/portal-team.json', import.meta.url);
const isMember = (m) =>
  m &&
  isText(m.slug) &&
  /^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.slug) &&
  isText(m.name) &&
  typeof m.role === 'string' &&
  isTextList(m.bio) &&
  isTextList(m.agentNames) &&
  typeof m.showOnAbout === 'boolean' &&
  ['line', 'photo', 'brn', 'phone', 'whatsapp', 'email'].every((k) => isTextOrNull(m[k]));
try {
  const teamUrl = FEED.replace(/\/$/, '').replace(/\/listings$/, '/team');
  const team = await download(teamUrl);
  if (!Array.isArray(team)) throw new Error('not a list');
  const members = team.filter((m) => {
    if (isMember(m)) return true;
    console.warn(`[team] Skipping ${m?.name ?? 'a team member'}: incomplete.`);
    return false;
  });
  const nextTeam = `${JSON.stringify(members, null, 1)}\n`;
  const currentTeam = await readFile(TEAM_FILE, 'utf8').catch(() => '');
  if (nextTeam !== currentTeam) await writeFile(TEAM_FILE, nextTeam);
  console.log(`[team] ${members.length} team members from the portal.`);
} catch (err) {
  console.warn(`[team] Could not read the team (${err.message}); keeping data/imported/portal-team.json as it is.`);
}
