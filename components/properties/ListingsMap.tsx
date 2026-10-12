'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { useEffect, useRef } from 'react';
import type { MarkerClusterGroup, Map as LeafletMap } from 'leaflet';
import { currencies } from '@/data/currency';
import { listingPlace, type Listing } from '@/data/properties';
import { useCurrency } from '@/lib/currency';
import { DUBAI, byBuilding, esc, pinLabel, popupHtml } from './mapPins';
import GoogleListingsMap from './GoogleListingsMap';

/**
 * The filtered listings on a map of Dubai, one price pin per building.
 * Leaflet with CARTO's light basemap (OpenStreetMap data), loaded in the
 * browser only.
 */
export default function ListingsMap({ listings }: { listings: Listing[] }) {
  /* A Google Maps key (Vercel env) switches to Google Maps; without one, this map */
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return <GoogleListingsMap listings={listings} />;
  return <LeafletListingsMap listings={listings} />;
}

function LeafletListingsMap({ listings }: { listings: Listing[] }) {
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
        map.current = L.map(el.current, { center: DUBAI, zoom: 11, scrollWheelZoom: false, zoomControl: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);
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
        const label = pinLabel(g.listings, perUnit);
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
