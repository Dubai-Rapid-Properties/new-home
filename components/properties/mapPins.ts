/** Shared by the Leaflet and Google listings maps: one price pin per building. */
import { bedsLabel, listingPlace, toPropertyCard, type Listing } from '@/data/properties';

/** Dubai, for a map with nothing on it */
export const DUBAI: [number, number] = [25.15, 55.25];

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** "2.5M", "850K" in the visitor's currency */
export function compact(aed: number, perUnit: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(aed / perUnit);
}

/** Listings in the same building share one pin */
export function byBuilding(listings: Listing[]) {
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

export function popupHtml(listings: Listing[], code: string, perUnit: number) {
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

/** "2.5M", or "from 1.2M · 3" for a building with several listings */
export function pinLabel(listings: Listing[], perUnit: number) {
  const from = Math.min(...listings.map((l) => l.price));
  return `${listings.length > 1 ? 'from ' : ''}${compact(from, perUnit)}${listings.length > 1 ? ` · ${listings.length}` : ''}`;
}
