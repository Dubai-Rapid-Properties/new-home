'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/lib/slugStore';
import PropertyCard from '../PropertyCard';

type Card = Parameters<typeof PropertyCard>[0];

/** Remembers that this listing was opened (on the listing page). */
export function TrackView({ slug }: { slug: string }) {
  const { add } = useRecentlyViewed();
  useEffect(() => add(slug), [slug, add]);
  return null;
}

/** The listings this visitor opened last, as a row of cards; nothing when there are none. */
export default function RecentlyViewed({ cards, exclude, className = '' }: { cards: Card[]; exclude?: string; className?: string }) {
  const { slugs, clear } = useRecentlyViewed();
  const bySlug = new Map(cards.map((c) => [c.item.id, c]));
  const items = slugs.filter((s) => s !== exclude).flatMap((s) => bySlug.get(s) ?? []).slice(0, 4);
  if (!items.length) return null;

  return (
    <section aria-labelledby="recent-heading" className={className}>
      <div className="flex items-end justify-between gap-4">
        <h2 id="recent-heading" className="font-serif text-[1.75rem] font-light text-charcoal">
          Recently viewed
        </h2>
        <button type="button" onClick={clear} className="text-[11px] uppercase tracking-eyebrow text-charcoal-muted hover:text-orange">
          Clear
        </button>
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c) => (
          <li key={c.item.id}>
            <PropertyCard {...c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
