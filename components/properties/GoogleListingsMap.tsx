'use client';

import { useEffect, useRef } from 'react';
import { MarkerClusterer, type Renderer } from '@googlemaps/markerclusterer';
import { currencies } from '@/data/currency';
import { listingPlace, type Listing } from '@/data/properties';
import { useCurrency } from '@/lib/currency';
import { DUBAI, byBuilding, pinLabel, popupHtml } from './mapPins';

/**
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  Google Cloud → Maps JavaScript API key,
 *                                  restricted to the website's addresses
 * NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID   optional: a Map ID from Google Cloud →
 *                                  Map Management (price pins need one;
 *                                  Google's DEMO_MAP_ID otherwise)
 */
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

let loading: Promise<void> | null = null;

/** Loads the Maps JavaScript API once per page. */
function loadGoogleMaps(): Promise<void> {
  if (typeof (window as { google?: typeof google }).google?.maps?.importLibrary === 'function') return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?v=weekly&loading=async&callback=__drpMapsReady`;
    script.async = true;
    (window as unknown as Record<string, () => void>).__drpMapsReady = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('Google Maps did not load'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** A cluster shows how many properties it holds, not how many buildings. */
const clusterRenderer = (Marker: typeof google.maps.marker.AdvancedMarkerElement): Renderer => ({
  render: ({ markers, position }) => {
    const count = markers.reduce((n, m) => n + Number((m as google.maps.marker.AdvancedMarkerElement).dataset?.count ?? 1), 0);
    const el = document.createElement('span');
    el.className = 'drp-map-cluster';
    el.textContent = String(count);
    return new Marker({ position, content: el, zIndex: 1000 + count });
  },
});

/** The filtered listings on a Google map of Dubai, one price pin per building. */
export default function GoogleListingsMap({ listings }: { listings: Listing[] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const clusterer = useRef<MarkerClusterer | null>(null);
  const info = useRef<google.maps.InfoWindow | null>(null);
  const { code } = useCurrency();
  const perUnit = currencies.find((c) => c.code === code)?.perUnit ?? 1;
  const unpinned = listings.filter((l) => !l.map.near).length;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadGoogleMaps();
      const { Map, InfoWindow } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
      const { LatLngBounds } = (await google.maps.importLibrary('core')) as google.maps.CoreLibrary;
      if (cancelled || !el.current) return;

      if (!map.current) {
        map.current = new Map(el.current, {
          center: { lat: DUBAI[0], lng: DUBAI[1] },
          zoom: 11,
          mapId: MAP_ID,
          /* Scroll the page; two fingers or Ctrl + scroll move the map */
          gestureHandling: 'cooperative',
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        });
        info.current = new InfoWindow();
        clusterer.current = new MarkerClusterer({ map: map.current, renderer: clusterRenderer(AdvancedMarkerElement) });
      }

      clusterer.current!.clearMarkers();
      info.current!.close();
      const groups = byBuilding(listings);
      const markers = groups.map((g) => {
        const pin = document.createElement('span');
        pin.className = `drp-map-pin${g.listings.some((l) => l.hotDeal) ? ' drp-map-pin-hot' : ''}`;
        pin.textContent = pinLabel(g.listings, perUnit);
        const marker = new AdvancedMarkerElement({
          position: { lat: g.near[0], lng: g.near[1] },
          content: pin,
          title: `${listingPlace(g.listings[0])}: ${g.listings.length} ${g.listings.length === 1 ? 'property' : 'properties'}`,
          gmpClickable: true,
        });
        marker.dataset.count = String(g.listings.length);
        marker.addListener('gmp-click', () => {
          info.current!.setContent(`<div class="drp-gmap-popup">${popupHtml(g.listings, code, perUnit)}</div>`);
          info.current!.open({ map: map.current!, anchor: marker });
        });
        return marker;
      });
      clusterer.current!.addMarkers(markers);

      if (groups.length) {
        const bounds = new LatLngBounds();
        for (const g of groups) bounds.extend({ lat: g.near[0], lng: g.near[1] });
        map.current.fitBounds(bounds, 48);
        if (groups.length === 1) map.current.setZoom(15);
      }
    })().catch((error) => console.error('[map]', error));
    return () => {
      cancelled = true;
    };
  }, [listings, code, perUnit]);

  return (
    <div>
      <div
        ref={el}
        role="region"
        aria-label="Map of the properties"
        className="drp-map drp-gmap relative z-0 h-[70vh] min-h-[420px] w-full overflow-hidden border border-line bg-cream"
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
