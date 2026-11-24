#!/usr/bin/env node
/**
 * Refreshes the Construction Tracker's progress figures from Dubai Land
 * Department's project register into data/market/construction.json: the
 * percent complete at DLD's latest site inspection, for each project on the
 * site: those in data/market/dld-projects.json (site name → DLD project
 * numbers, checked by hand), and every other project whose name and developer
 * match one DLD project.
 *
 * Source: DLD open data (dubailand.gov.ae → Open Data → Real Estate Data →
 * Projects), which serves the projects that start, finish or were adopted in
 * the current year, without a key.
 *
 *   npm run sync:construction       refresh if the figures are over 20 hours old
 *   DLD_SYNC_FORCE=1                refresh now
 *
 * Runs before every build. A project DLD no longer serves keeps its last
 * figure, and if DLD fails the build carries on with the current file.
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

const ENDPOINT = 'https://gateway.dubailand.gov.ae/open-data/projects';
const OUT = new URL('../data/market/construction.json', import.meta.url);
const MAPPING = new URL('../data/market/dld-projects.json', import.meta.url);
const SITE_PROJECTS = [
  new URL('../data/market/pf-projects.json', import.meta.url),
  new URL('../data/imported/projects.json', import.meta.url),
];
const PAGE = 500;
const MAX_AGE_HOURS = 20;
/** DLD's date filters: 1 start, 2 end, 3 adoption, 4 completion */
const DATE_TYPES = ['1', '2', '3', '4'];

const log = (...a) => console.log('[construction-sync]', ...a);

async function page(dateType, from, to, skip) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: 'https://dubailand.gov.ae',
          Referer: 'https://dubailand.gov.ae/',
          // DLD's gateway turns away requests without a browser's user agent
          'User-Agent': 'Mozilla/5.0 (compatible; DRP-site-sync/1.0)',
        },
        body: JSON.stringify({
          P_FROM_DATE: from,
          P_TO_DATE: to,
          P_DATE_TYPE: dateType,
          P_PRJ_TYPE_ID: '',
          P_PRJ_STATUS: '',
          P_ZONE_ID: '',
          P_AREA_ID: '',
          P_TAKE: String(PAGE),
          P_SKIP: String(skip),
          P_SORT: '',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      return body.response?.result ?? [];
    } catch (err) {
      if (attempt >= 4) throw new Error(`date type ${dateType} from ${skip}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

/** Every project DLD serves this year, by project number */
async function allProjects(today) {
  const year = today.getUTCFullYear();
  const byNumber = new Map();
  await Promise.all(
    DATE_TYPES.map(async (dateType) => {
      for (let skip = 0; ; skip += PAGE) {
        const batch = await page(dateType, `01/01/${year}`, `12/31/${year}`, skip);
        batch.forEach((p) => byNumber.set(p.PROJECT_NUMBER, p));
        if (batch.length < PAGE) break;
      }
    }),
  );
  return byNumber;
}

/** A name as data/offPlan.ts compares it: W1NNER = Winner, "X by Binghatti" = "X", "Phase 2" = "2" */
const matchName = (name) =>
  String(name ?? '')
    .toLowerCase()
    .replace(/(?<=[a-z])1(?=[a-z])/g, 'i')
    .replace(/(?<=[a-z])0(?=[a-z])/g, 'o')
    .replace(/\s+by\s+.*$/, '')
    .replace(/\bphase\s*/g, '')
    .replace(/[^a-z0-9]/g, '');

/** The words of a developer's name that tell it apart: "Dugasta Properties Development L.L.C" → dugasta */
const STOCK_WORDS = new Set(
  'real estate estates development developments developer developers properties property group holding holdings investment investments llc l l c co company fze fzco dmcc limited ltd the and of'.split(' '),
);
const developerWords = (name) =>
  String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOCK_WORDS.has(w));
const sameDeveloper = (a, b) => {
  const words = new Set(developerWords(a));
  return developerWords(b).some((w) => words.has(w));
};

const usable = (p) => p && p.PROJECT_STATUS !== 'CANCELLED' && p.PERCENT_COMPLETED >= 0 && p.PERCENT_COMPLETED <= 100;

/**
 * Site projects the hand-checked mapping leaves out, matched to DLD by name:
 * exactly one live DLD project of that name whose developer shares a word with
 * the site's, so a common name ("Riviera") never takes another developer's figure.
 */
async function matchedByName(dld, mapped) {
  const byName = new Map();
  for (const p of dld.values()) {
    if (!usable(p)) continue;
    const key = matchName(p.PROJECT_EN);
    if (key.length < 4) continue;
    byName.set(key, [...(byName.get(key) ?? []), p]);
  }
  const site = [];
  for (const file of SITE_PROJECTS) {
    const data = JSON.parse(await readFile(file, 'utf8').catch(() => 'null'));
    const list = Array.isArray(data) ? data : (data?.projects ?? []);
    list.forEach((p) => p?.name && site.push({ name: p.name, developer: p.developer }));
  }
  const matches = {};
  for (const { name, developer } of site) {
    if (mapped.has(name) || matches[name]) continue;
    const found = (byName.get(matchName(name)) ?? []).filter((p) => sameDeveloper(p.DEVELOPER_EN, developer));
    if (found.length === 1) matches[name] = [found[0].PROJECT_NUMBER];
  }
  return matches;
}

async function main() {
  const previous = JSON.parse(await readFile(OUT, 'utf8').catch(() => 'null'));
  const ageHours = previous?.updatedAt ? (Date.now() - Date.parse(previous.updatedAt)) / 36e5 : Infinity;
  if (ageHours < MAX_AGE_HOURS && !process.env.DLD_SYNC_FORCE) {
    log(`figures are ${ageHours.toFixed(1)} hours old — keeping them.`);
    return;
  }

  const today = new Date();
  const dld = await allProjects(today);
  log(`${dld.size} projects from DLD`);
  /* A partial answer would replace good figures with nothing */
  if (dld.size < 100) {
    log('too few projects — keeping the current figures.');
    return;
  }

  const { _, ...checked } = JSON.parse(await readFile(MAPPING, 'utf8'));
  const byName = await matchedByName(dld, new Set(Object.keys(checked)));
  log(`${Object.keys(byName).length} more projects matched to DLD by name and developer`);
  /* Projects matched before keep their DLD number once DLD stops serving them */
  const earlier = Object.fromEntries(
    Object.entries(previous?.projects ?? {}).filter(([name, p]) => !checked[name] && !byName[name] && p.matched),
  );
  const mapping = { ...checked, ...byName };
  const projects = {};
  let refreshed = 0;
  for (const [name, p] of Object.entries(earlier)) projects[name] = p;
  for (const [name, numbers] of Object.entries(mapping)) {
    const found = numbers.map((n) => dld.get(n)).filter(usable);
    if (found.length === numbers.length) {
      const inspected = found.map((p) => String(p.INSPECTION_DATE ?? '').slice(0, 10)).sort().pop();
      projects[name] = {
        progress: Math.round((found.reduce((sum, p) => sum + p.PERCENT_COMPLETED, 0) / found.length) * 10) / 10,
        inspected: inspected || null,
        dld: numbers,
        ...(byName[name] && { matched: true }),
      };
      refreshed++;
    } else if (previous?.projects?.[name]) {
      /* DLD serves only this year's projects: keep the last figure we had */
      projects[name] = previous.projects[name];
    }
  }

  await writeFile(
    OUT,
    `${JSON.stringify({ source: 'Dubai Land Department open data — project register', updatedAt: today.toISOString(), projects }, null, 1)}\n`,
  );
  log(`wrote ${Object.keys(projects).length} projects (${refreshed} refreshed from DLD)`);
}

main().catch((err) => {
  /* Never fail the build over the sync: the tracker keeps its last figures */
  log(`sync failed, keeping the current figures: ${err.message}`);
});
