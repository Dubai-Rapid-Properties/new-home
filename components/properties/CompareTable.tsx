'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useCompare } from '@/lib/slugStore';
import Price from '../ui/Price';
import PricePerArea from '../ui/PricePerArea';
import Size, { UnitName } from '../ui/Size';
import ArrowLink from '../ui/ArrowLink';
import SmartLink from '../ui/SmartLink';

export type CompareListing = {
  slug: string;
  href: string;
  title: string;
  image: string;
  offering: 'buy' | 'rent';
  price: number;
  size: number;
  type: string;
  beds: string;
  baths: number;
  area: string;
  building: string | null;
  completion: string;
  furnishing: string | null;
  permit: string | null;
};

const PER_AREA = 'Price per area';

const ROWS: [string, (l: CompareListing) => React.ReactNode][] = [
  ['Price', (l) => (<><Price aed={l.price} />{l.offering === 'rent' ? ' / year' : ''}</>)],
  [PER_AREA, (l) => (l.size ? <PricePerArea aedPerSqft={l.price / l.size} unit={false} /> : '—')],
  ['For', (l) => (l.offering === 'rent' ? 'Rent' : 'Sale')],
  ['Type', (l) => l.type],
  ['Bedrooms', (l) => l.beds],
  ['Bathrooms', (l) => l.baths],
  ['Size', (l) => <Size sqft={l.size} />],
  ['Area', (l) => l.area],
  ['Building', (l) => l.building ?? '—'],
  ['Status', (l) => l.completion],
  ['Furnishing', (l) => l.furnishing ?? '—'],
  ['DLD permit', (l) => l.permit ?? '—'],
];

/** The picked listings side by side, one column each. */
export default function CompareTable({ listings }: { listings: CompareListing[] }) {
  const { slugs, remove, clear } = useCompare();
  const bySlug = new Map(listings.map((l) => [l.slug, l]));
  const picked = slugs.flatMap((s) => bySlug.get(s) ?? []);

  if (picked.length < 2) {
    return (
      <div className="mt-12 bg-white p-8 sm:p-12">
        <p className="font-serif text-2xl text-charcoal">
          {picked.length ? 'Pick one more property to compare.' : 'Nothing to compare yet.'}
        </p>
        <p className="mt-3 max-w-xl font-light text-charcoal-muted">
          Tap the compare button on up to three properties and they appear here side by side.
        </p>
        <div className="mt-8">
          <ArrowLink href="/properties" label="Browse properties" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="overflow-x-auto bg-white">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
          <thead>
            <tr>
              <th className="w-40 p-4" />
              {picked.map((l) => (
                <th key={l.slug} className="p-4 align-top font-normal">
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    <Image src={l.image} alt="" fill sizes="(max-width: 1024px) 40vw, 360px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => remove(l.slug)}
                      aria-label={`Remove ${l.title} from the comparison`}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal hover:text-orange"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                  <SmartLink href={l.href} className="mt-3 line-clamp-2 block font-serif text-lg leading-snug text-charcoal hover:text-orange">
                    {l.title}
                  </SmartLink>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, value]) => (
              <tr key={label} className="border-t border-line">
                <th scope="row" className="p-4 text-[10px] font-normal uppercase tracking-eyebrow text-charcoal-muted">
                  {label === PER_AREA ? <>Price per <UnitName /></> : label}
                </th>
                {picked.map((l) => (
                  <td key={l.slug} className="p-4 text-[15px] font-light text-charcoal">
                    {value(l)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={clear} className="mt-6 text-[11px] uppercase tracking-eyebrow text-charcoal-muted hover:text-orange">
        Clear the comparison
      </button>
    </div>
  );
}
