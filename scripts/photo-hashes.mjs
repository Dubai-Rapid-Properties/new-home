#!/usr/bin/env node
/**
 * A fingerprint (64-bit difference hash) of each photo on D|R|P's own project
 * pages and of the Property Finder photos that can top those galleries up,
 * into data/imported/photo-hashes.json. data/offPlan.ts uses it to leave out a
 * Property Finder photo that is the same render as one D|R|P already shows
 * (the two sites keep it under different addresses).
 *
 *   npm run hash:photos
 *
 * Run it after `npm run import:drp` or `npm run sync:pf-projects`.
 */
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const child = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(child.status ?? 1);
}

const root = new URL('..', import.meta.url);
const OUT = new URL('data/imported/photo-hashes.json', root);
const json = async (p) => JSON.parse(await readFile(new URL(p, root), 'utf8'));

/* The same name matching as data/offPlan.ts */
const matchName = (name) =>
  name
    .toLowerCase()
    .replace(/(?<=[a-z])1(?=[a-z])/g, 'i')
    .replace(/(?<=[a-z])0(?=[a-z])/g, 'o')
    .replace(/\s+by\s+.*$/, '')
    .replace(/\bphase\s*/g, '')
    .replace(/[^a-z0-9]/g, '');

async function hash(input) {
  const { data } = await sharp(input).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  let bits = '';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += data[y * 9 + x] > data[y * 9 + x + 1] ? '1' : '0';
  return BigInt(`0b${bits}`).toString(16).padStart(16, '0');
}

const drp = await json('data/imported/projects.json');
const pf = (await json('data/market/pf-projects.json')).projects;
const offPlan = await readFile(new URL('data/offPlan.ts', root), 'utf8');
const pinnedPaths = new Set([...offPlan.matchAll(/^\s+'?[a-z0-9-]+'?: '([a-z0-9-]+\/[a-z0-9-]+)',$/gm)].map((m) => m[1]));
const names = new Set(drp.map((p) => matchName(p.name)));

const out = {};
for (const p of drp)
  for (const src of [p.image, ...p.gallery].filter(Boolean)) {
    if (out[src]) continue;
    try {
      out[src] = await hash(new URL(`public${src}`, root).pathname);
    } catch {
      /* missing file */
    }
  }
let n = 0;
for (const r of pf) {
  if (!names.has(matchName(r.name)) && !pinnedPaths.has(r.path)) continue;
  for (const key of r.images) {
    const url = `https://new-projects-media.propertyfinder.com/project/${r.id}/gallery/image/${key}/small.webp`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      out[key] = await hash(Buffer.from(await res.arrayBuffer()));
      n++;
    } catch {
      /* skip */
    }
  }
}
await writeFile(OUT, `${JSON.stringify(out, null, 0).replace(/,"/g, ',\n"')}\n`);
console.log(`[photo-hashes] ${Object.keys(out).length} photos (${n} from Property Finder)`);
