'use client';

import { contact } from '@/data/homepage';
import { useFavourites } from '@/lib/favourites';
import PropertyCard from '../PropertyCard';
import ArrowLink from '../ui/ArrowLink';

type Card = Parameters<typeof PropertyCard>[0];

/** The visitor's saved listings, with a way to send the shortlist to DRP. */
export default function SavedList({ cards }: { cards: Card[] }) {
  const { saved, clear } = useFavourites();
  const bySlug = new Map(cards.map((c) => [c.item.id, c]));
  const items = saved.flatMap((slug) => bySlug.get(slug) ?? []);

  if (!items.length) {
    return (
      <div className="mt-12 bg-white p-8 sm:p-12">
        <p className="font-serif text-2xl text-charcoal">No saved properties yet.</p>
        <p className="mt-3 max-w-xl font-light text-charcoal-muted">
          Tap the heart on any property to keep it here. Your shortlist stays in this browser, and you can send it to
          D|R|P in one message.
        </p>
        <div className="mt-8">
          <ArrowLink href="/properties" label="Browse properties" />
        </div>
      </div>
    );
  }

  const message = [
    'Hello D|R|P, I would like to know more about these properties:',
    ...items.map((c) => `• ${c.item.title} — ${new URL(c.item.href, window.location.origin).href}`),
  ].join('\n');

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href={`${contact.whatsappHref}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center bg-orange px-6 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-orange-600"
        >
          Send my shortlist on WhatsApp
        </a>
        <button
          type="button"
          onClick={clear}
          className="h-11 px-2 text-[11px] uppercase tracking-eyebrow text-charcoal-muted transition-colors duration-300 hover:text-orange"
        >
          Clear all
        </button>
      </div>
      <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
        {items.map((c) => (
          <li key={c.item.id}>
            <PropertyCard {...c} />
          </li>
        ))}
      </ul>
    </>
  );
}
