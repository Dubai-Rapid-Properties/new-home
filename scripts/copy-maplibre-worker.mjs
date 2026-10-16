/**
 * MapLibre 6 runs its tile worker from a separate file that the bundler does
 * not emit, so it is copied into public/ and the map points at it
 * (components/properties/englishBasemap.ts). Runs before every build and dev
 * start, so it always matches the installed version; the copy is not committed.
 */
import { copyFileSync, mkdirSync } from 'node:fs';

const from = new URL('../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url);
const dir = new URL('../public/maplibre/', import.meta.url);
mkdirSync(dir, { recursive: true });
copyFileSync(from, new URL('maplibre-gl-worker.mjs', dir));
