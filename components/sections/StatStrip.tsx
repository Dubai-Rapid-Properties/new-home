import type { ReactNode } from 'react';
import Reveal from '../ui/Reveal';

export type Stat = { value: ReactNode; label: ReactNode };

type Props = { items: Stat[]; tone?: 'white' | 'cream' | 'dark'; note?: string };

/** Serif figures with small labels, divided by hairlines. */
export default function StatStrip({ items, tone = 'white', note }: Props) {
  const dark = tone === 'dark';
  const cols = items.length === 4 ? 'lg:grid-cols-4' : items.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
  return (
    <section
      aria-label="Key figures"
      className={`py-14 sm:py-20 ${dark ? 'bg-ink text-white' : tone === 'cream' ? 'bg-cream' : 'bg-white'}`}
    >
      <div className="container-drp">
        <ul
          className={`grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 ${cols} ${
            dark ? 'divide-white/10' : 'divide-line'
          }`}
        >
          {items.map((s, i) => (
            <Reveal
              as="li"
              key={i}
              delay={i * 0.08}
              className={`py-7 sm:py-4 sm:pr-8 ${
                i > 0 ? `lg:border-l lg:pl-8 ${dark ? 'lg:border-white/10' : 'lg:border-line'}` : ''
              }`}
            >
              <p
                className={`font-serif text-[clamp(2.4rem,4.4vw,3.5rem)] font-light leading-none ${
                  dark ? 'text-white' : 'text-charcoal'
                }`}
              >
                {s.value}
              </p>
              <p
                className={`mt-3 text-[11px] uppercase tracking-eyebrow ${
                  dark ? 'text-white/50' : 'text-charcoal-muted'
                }`}
              >
                {s.label}
              </p>
            </Reveal>
          ))}
        </ul>
        {note ? (
          <p className={`mt-8 text-xs font-light ${dark ? 'text-white/35' : 'text-charcoal-muted/80'}`}>
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
