'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import {
  byTopPicks,
  hotDealsFirst,
  listingFacets,
  rentListings,
  saleListings,
  toPropertyCard,
  type Listing,
  type Offering,
} from '@/data/properties';
import { priceSelection, type Selection } from '@/lib/filters';
import { toSlug } from '@/lib/slug';
import { areaSlugs } from '@/data/dubaiAreas';
import PropertyCard from '../PropertyCard';
import FilterExplorer, { type SortOption } from '../filters/FilterExplorer';

/* Leaflet needs the browser; the map loads only when someone opens it */
const ListingsMap = dynamic(() => import('./ListingsMap'), {
  ssr: false,
  loading: () => <div className="h-[70vh] min-h-[420px] w-full animate-pulse border border-line bg-cream" />,
});
const renderMap = (results: Listing[]) => <ListingsMap listings={results} />;

const sorts: SortOption<Listing>[] = [
  { id: 'top-picks', label: 'Top Picks', compare: byTopPicks },
  { id: 'newest', label: 'Newest', compare: (a, b) => b.listedAt.localeCompare(a.listedAt) },
  { id: 'price-asc', label: 'Price: low to high', compare: (a, b) => a.price - b.price },
  { id: 'price-desc', label: 'Price: high to low', compare: (a, b) => b.price - a.price },
  { id: 'size-desc', label: 'Largest first', compare: (a, b) => b.size - a.size },
];

/* The first option is the default; hot deals stay first in every order */
const sortOptions = sorts.map((o) => ({ ...o, compare: hotDealsFirst(o.compare) }));

const tabs: { id: Offering; label: string }[] = [
  { id: 'buy', label: 'Buy' },
  { id: 'rent', label: 'Rent' },
];

const matching = (offering: Offering, key: string, value: string | null) => {
  if (!value) return [];
  const facet = listingFacets[offering].find((f) => f.key === key)!;
  const slugs = key === 'area' ? areaSlugs(value) : [value];
  return facet.options.filter((o) => o.id === value || slugs.includes(toSlug(o.label))).map((o) => o.id);
};

/**
 * The search bars send ?offering=buy&q=dubai-marina&type=apartment&beds=2&min=…&max=…
 * `q` matches an area; anything else typed is ignored rather than hiding everything.
 */
function selectionFromParams(offering: Offering, params: URLSearchParams): Selection {
  const min = Number(params.get('min')) || undefined;
  const max = Number(params.get('max')) || undefined;
  return {
    area: matching(offering, 'area', params.get('q')),
    type: matching(offering, 'type', params.get('type')),
    beds: matching(offering, 'beds', params.get('beds')),
    price: priceSelection(min, max),
  };
}

function Explorer({
  initialOffering = 'buy',
  initialSelection,
}: {
  initialOffering?: Offering;
  initialSelection?: Selection;
}) {
  const [offering, setOffering] = useState<Offering>(initialOffering);

  /* The menu links to /properties?offering=rent while this page is already open,
     which changes the URL without remounting — follow it. */
  useEffect(() => setOffering(initialOffering), [initialOffering]);

  const switchTo = (next: Offering) => {
    setOffering(next);
    /* Keep the address shareable without a navigation */
    const url = new URL(window.location.href);
    url.searchParams.set('offering', next);
    window.history.replaceState(null, '', url);
  };

  const leading = (
    <div role="group" aria-label="Buy or rent" className="mr-2 flex rounded-md border border-line bg-white p-1">
      {tabs.map((t) => {
        const active = offering === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={active}
            onClick={() => switchTo(t.id)}
            className={`h-9 rounded px-5 text-[13px] transition-colors duration-300 ${
              active ? 'bg-charcoal text-white' : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <FilterExplorer
      items={offering === 'buy' ? saleListings : rentListings}
      facets={listingFacets[offering]}
      getKey={(l) => l.slug}
      renderItem={(l) => <PropertyCard {...toPropertyCard(l)} />}
      noun={['property', 'properties']}
      initialSelection={initialSelection}
      sortOptions={sortOptions}
      leading={leading}
      renderMap={renderMap}
      emptyHint="Try removing a filter, or tell a specialist what you are looking for — many listings are shared privately."
    />
  );
}

function ExplorerFromUrl() {
  const params = useSearchParams();
  const offering: Offering = params.get('offering') === 'rent' ? 'rent' : 'buy';
  const selection = useMemo(
    () => selectionFromParams(offering, new URLSearchParams(params.toString())),
    /* Read once: later changes are the visitor's, not the URL's */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return <Explorer initialOffering={offering} initialSelection={selection} />;
}

/** Ready-property explorer for /properties. */
export default function PropertyExplorer() {
  return (
    <Suspense fallback={<Explorer />}>
      <ExplorerFromUrl />
    </Suspense>
  );
}
