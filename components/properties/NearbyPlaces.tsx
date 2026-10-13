'use client';

import { useId, useState } from 'react';
import { GraduationCap, HeartPulse, TrainFront, UtensilsCrossed } from 'lucide-react';
import type { Nearby } from '@/data/nearby';

const TABS = [
  { id: 'schools', label: 'Schools', Icon: GraduationCap },
  { id: 'restaurants', label: 'Restaurants', Icon: UtensilsCrossed },
  { id: 'hospitals', label: 'Hospitals', Icon: HeartPulse },
  { id: 'metro', label: 'Metro & tram', Icon: TrainFront },
] as const;

/** Rough door-to-door time: walking up to 1.2 km, driving beyond */
function travel(km: number) {
  if (km <= 1.2) return `${Math.max(1, Math.round(km * 12))} min walk`;
  return `${Math.max(3, Math.round(km * 2 + 2))} min drive`;
}

/** Schools, restaurants, hospitals and stations near the listing, in tabs */
export default function NearbyPlaces({ nearby }: { nearby: Nearby }) {
  const uid = useId();
  const tabs = TABS.filter((t) => nearby[t.id].length);
  const [active, setActive] = useState<(typeof TABS)[number]['id']>(tabs[0]?.id ?? 'schools');
  if (!tabs.length) return null;
  const places = nearby[active];

  return (
    <div className="mt-8">
      <p className="eyebrow text-charcoal-muted">What&rsquo;s nearby</p>
      <div role="tablist" aria-label="Nearby places" className="mt-4 flex flex-wrap gap-2">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${uid}-tab-${id}`}
            aria-selected={active === id}
            aria-controls={`${uid}-panel`}
            onClick={() => setActive(id)}
            className={`inline-flex items-center gap-2 border px-4 py-2 text-[13px] transition-colors duration-300 ${
              active === id ? 'border-charcoal bg-charcoal text-white' : 'border-line text-charcoal hover:border-charcoal'
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>
      <ul id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="mt-4 border-t border-line">
        {places.map((p) => (
          <li key={p.name} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[15px]">
            <span className="min-w-0 truncate font-light text-charcoal">{p.name}</span>
            <span className="shrink-0 text-[13px] text-charcoal-muted">
              {p.km.toFixed(1)} km · {travel(p.km)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-light text-charcoal-muted">
        Distances in a straight line, from OpenStreetMap. Times are a rough guide.
      </p>
    </div>
  );
}
