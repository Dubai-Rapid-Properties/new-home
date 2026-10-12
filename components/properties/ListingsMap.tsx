'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import type { MarkerClusterGroup, Map as LeafletMap } from 'leaflet';
import { currencies } from '@/data/currency';
import { bedsLabel, listingPlace, toPropertyCard, type Listing } from '@/data/properties';
import { useCurrency } from '@/lib/currency';
import { englishBasemap } from './englishBasemap';

/** Dubai, for a map with nothing on it */
const DUBAI: [number, number] = [25.15, 55.25];

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** "2.5M", "850K" in the visitor's currency */
function compact(aed: number, perUnit: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(aed / perUnit);
}

/** Listings in the same building share one pin */
function byBuilding(listings: Listing[]) {
  const groups = new Map<string, { near: [number, number]; listings: Listing[] }>();
  for (const l of listings) {
    if (!l.map.near) continue;
    const key = l.map.near.join(',');
    const group = groups.get(key) ?? { near: l.map.near, listings: [] };
    group.listings.push(l);
    groups.set(key, group);
  }
  return [...groups.values()];
}

function popupHtml(listings: Listing[], code: string, perUnit: number) {
  const place = listingPlace(listings[0]);
  const rows = listings
    .map((l) => {
      const card = toPropertyCard(l).item;
      const price = `${code} ${compact(l.price, perUnit)}${l.offering === 'rent' ? ' / yr' : ''}`;
      return `<li><a class="drp-map-row" href="${esc(card.href)}">
        <img src="${esc(card.image)}" alt="" loading="lazy" width="72" height="56" />
        <span><strong>${esc(price)}</strong><span>${esc(`${bedsLabel(l.beds)} · ${l.type} · ${l.size.toLocaleString('en-US')} sq ft`)}</span><span class="drp-map-title">${esc(l.title)}</span></span>
      </a></li>`;
    })
    .join('');
  return `<p class="drp-map-place">${esc(place)}</p><ul class="drp-map-list">${rows}</ul>`;
}

/**
 * The filtered listings on a map of Dubai, one price pin per building.
 * Leaflet over OpenFreeMap's light basemap with English labels
 * (englishBasemap.ts), loaded in the browser only.
 */
export default function ListingsMap({ listings }: { listings: Listing[] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const pins = useRef<MarkerClusterGroup | null>(null);
  const { code } = useCurrency();
  const perUnit = currencies.find((c) => c.code === code)?.perUnit ?? 1;
  const unpinned = listings.filter((l) => !l.map.near).length;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      /* The cluster plugin extends the global L */
      (window as unknown as { L: typeof L }).L = L;
      await import('leaflet.markercluster');
      if (cancelled || !el.current) return;
      if (!map.current) {
        /* maxZoom: the cluster plugin needs it, and the basemap layer does not set one */
        map.current = L.map(el.current, { center: DUBAI, zoom: 11, maxZoom: 19, scrollWheelZoom: false, zoomControl: true });
        void englishBasemap(L, map.current);
        /* Scroll the page, not the map, until the map is clicked */
        map.current.on('click', () => map.current?.scrollWheelZoom.enable());
        /* Nearby buildings merge into one count until zoomed in */
        pins.current = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 48,
          spiderfyOnMaxZoom: true,
          iconCreateFunction: (cluster) =>
            L.divIcon({
              className: '',
              html: `<span class="drp-map-cluster">${cluster
                .getAllChildMarkers()
                .reduce((n, m) => n + ((m.options as { count?: number }).count ?? 1), 0)}</span>`,
              iconSize: [40, 40],
            }),
        }).addTo(map.current);
      }
      pins.current!.clearLayers();
      /* Popups fit inside the map on a phone */
      const popupWidth = Math.min(300, el.current.clientWidth - 72);
      const groups = byBuilding(listings);
      for (const g of groups) {
        const from = Math.min(...g.listings.map((l) => l.price));
        const label = `${g.listings.length > 1 ? 'from ' : ''}${compact(from, perUnit)}${g.listings.length > 1 ? ` · ${g.listings.length}` : ''}`;
        const hot = g.listings.some((l) => l.hotDeal);
        L.marker(g.near, {
          icon: L.divIcon({
            className: '',
            html: `<span class="drp-map-pin${hot ? ' drp-map-pin-hot' : ''}">${esc(label)}</span>`,
            iconSize: undefined,
            iconAnchor: [0, 0],
          }),
          title: `${listingPlace(g.listings[0])}: ${g.listings.length} ${g.listings.length === 1 ? 'property' : 'properties'}`,
          riseOnHover: true,
          /* Read by the cluster icon, which counts properties, not buildings */
          count: g.listings.length,
        } as L.MarkerOptions)
          .bindPopup(popupHtml(g.listings, code, perUnit), { maxWidth: popupWidth, minWidth: popupWidth, autoPanPadding: [16, 16] })
          .addTo(pins.current!);
      }
      if (groups.length) {
        map.current.fitBounds(L.latLngBounds(groups.map((g) => g.near)), { padding: [48, 48], maxZoom: 15 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listings, code, perUnit]);

  useEffect(
    () => () => {
      map.current?.remove();
      map.current = null;
    },
    [],
  );

  return (
    <div>
      <div
        ref={el}
        role="region"
        aria-label="Map of the properties"
        className="drp-map relative z-0 h-[70vh] min-h-[420px] w-full overflow-hidden border border-line bg-cream"
      />
      {unpinned ? (
        <p className="mt-3 text-[12px] font-light text-charcoal-muted">
          {unpinned} {unpinned === 1 ? 'property has' : 'properties have'} no map location yet — switch to the grid to see{' '}
          {unpinned === 1 ? 'it' : 'them'}.
        </p>
      ) : null}
    </div>
  );
}
