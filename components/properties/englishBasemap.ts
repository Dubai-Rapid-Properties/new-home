import type * as Leaflet from 'leaflet';

/**
 * The listings map's background: OpenFreeMap's light "Positron" style
 * (free, no key, no usage limits - https://openfreemap.org), drawn with
 * MapLibre inside Leaflet so the price pins and clusters stay as they are.
 *
 * OpenStreetMap's own tiles label Dubai in Arabic. Here every label shows
 * the English name, or the name written in Latin letters when there is no
 * English one - never Arabic script.
 */
const STYLE = 'https://tiles.openfreemap.org/styles/positron';
const ENGLISH = ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ''];
const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

type StyleLayer = { type: string; layout?: Record<string, unknown> };

export async function englishBasemap(L: typeof Leaflet, map: Leaflet.Map): Promise<void> {
  try {
    const [{ maplibreGL }, { getVersion, setWorkerUrl }, style] = await Promise.all([
      import('@maplibre/maplibre-gl-leaflet'),
      import('maplibre-gl'),
      fetch(STYLE).then((res) => {
        if (!res.ok) throw new Error(`map style: HTTP ${res.status}`);
        return res.json() as Promise<{ layers: StyleLayer[] }>;
      }),
    ]);
    for (const layer of style.layers) {
      const field = layer.layout?.['text-field'];
      /* Road numbers (shields) keep their ref; every name label goes English */
      if (layer.type === 'symbol' && field && JSON.stringify(field).includes('name')) layer.layout!['text-field'] = ENGLISH;
    }
    /* MapLibre 6 loads its worker from a file of its own, copied to public/ at build time */
    setWorkerUrl(`/maplibre/maplibre-gl-worker.mjs?v=${getVersion()}`);
    maplibreGL({ style: style as never, attributionControl: false }).addTo(map);
    map.attributionControl?.addAttribution(ATTRIBUTION);
  } catch (error) {
    /* Never leave the map blank: fall back to OpenStreetMap's own tiles */
    console.error('[map] English basemap unavailable, using OpenStreetMap tiles', error);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
  }
}
