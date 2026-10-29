'use client';

import { useState } from 'react';
import { formatPressDate, type PressItem } from '@/data/pressNews';

/** One story: a link to the article on the publisher's site. */
function PressCard({ item }: { item: PressItem }) {
  return (
    <article className="group h-full">
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal">
          {item.image ? (
            // Publishers' own story images, served from their sites.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full w-full items-end p-6">
              <p className="font-serif text-2xl leading-tight text-white/90">{item.source}</p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <p className="mt-5 text-[10px] font-medium uppercase tracking-eyebrow text-orange">{item.source}</p>
          <h3 className="mt-3 font-serif text-xl font-normal leading-snug text-charcoal transition-colors duration-300 group-hover:text-orange sm:text-[1.3rem]">
            {item.title}
          </h3>
          {item.summary ? (
            <p className="mt-3 line-clamp-3 text-[14px] font-light leading-relaxed text-charcoal-muted">{item.summary}</p>
          ) : null}
          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between border-t border-line pt-4 text-[11px] font-light uppercase tracking-wide text-charcoal-muted">
              <time dateTime={item.date}>{formatPressDate(item.date)}</time>
              <span>
                Read on {item.source} <span aria-hidden="true">↗</span>
              </span>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}

/** Dubai property news from the region's publications, filterable by publication. */
export default function PressFeed({ items }: { items: PressItem[] }) {
  const sources = [...new Set(items.map((i) => i.source))].sort((a, b) => a.localeCompare(b));
  const [source, setSource] = useState<string | null>(null);
  const shown = source ? items.filter((i) => i.source === source) : items;
  const tabs: { id: string | null; label: string }[] = [{ id: null, label: 'All' }, ...sources.map((s) => ({ id: s, label: s }))];

  return (
    <div>
      {sources.length > 1 ? (
        <div role="group" aria-label="Filter by publication" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {tabs.map((t) => {
            const active = t.id === source;
            return (
              <button
                key={t.label}
                type="button"
                aria-pressed={active}
                onClick={() => setSource(t.id)}
                className={`h-11 shrink-0 rounded-full border px-5 text-[13px] transition-colors duration-300 ${
                  active ? 'border-charcoal bg-charcoal text-white' : 'border-charcoal/20 bg-white text-charcoal hover:border-charcoal/50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {shown.length} stories
      </p>
      <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
        {shown.map((item) => (
          <li key={item.url}>
            <PressCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
