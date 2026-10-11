'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * One labelled pin on the building, at Property Finder's coordinates. A
 * Google embed searches by name and pins every match nearby; this pins
 * only the listing's own building.
 */
export default function PinMap({ near, name, title }: { near: [number, number]; name: string; title: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import('leaflet').Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !el.current) return;
      map = L.map(el.current, { center: near, zoom: 16, scrollWheelZoom: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      /* Scroll the page, not the map, until the map is clicked */
      map.on('click', () => map?.scrollWheelZoom.enable());
      L.marker(near, {
        icon: L.divIcon({ className: '', html: `<span class="drp-map-pin drp-map-pin-hot">${esc(name)}</span>`, iconAnchor: [0, 0] }),
        title: name,
        keyboard: false,
      }).addTo(map);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [near, name]);

  return <div ref={el} role="img" aria-label={title} className="drp-map absolute inset-0 z-0 h-full w-full" />;
}
