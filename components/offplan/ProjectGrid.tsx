'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { byPriceDesc, facetsFor, type ProjectCardData } from '@/lib/offPlanCards';
import { priceSelection, type Facet, type Selection } from '@/lib/filters';
import { toSlug } from '@/lib/slug';
import { areaSlugs } from '@/data/dubaiAreas';
import FilterExplorer, { type SortOption } from '../filters/FilterExplorer';
import ProjectCard from './ProjectCard';

/* Projects priced on request go last either way */
const price = (p: ProjectCardData) => p.fromPrice ?? Infinity;

const sorts: Record<'newest' | 'price-asc' | 'price-desc' | 'handover', SortOption<ProjectCardData>> = {
  newest: { id: 'newest', label: 'Newest launches', compare: (a, b) => b.launchedAt.localeCompare(a.launchedAt) },
  'price-asc': { id: 'price-asc', label: 'Price: low to high', compare: (a, b) => price(a) - price(b) },
  'price-desc': { id: 'price-desc', label: 'Price: high to low', compare: byPriceDesc },
  handover: {
    id: 'handover',
    label: 'Earliest handover',
    /* Projects without a confirmed year go last */
    compare: (a, b) => (a.handoverYear ?? 9999) - (b.handoverYear ?? 9999),
  },
};

export type DefaultSort = keyof typeof sorts;

/** The chosen sort first: FilterExplorer starts on the first option. */
const sortOptionsFrom = (first: DefaultSort) => [sorts[first], ...Object.values(sorts).filter((o) => o !== sorts[first])];

/* Cards shown at first, and added by each "Show more" */
const PAGE_SIZE = 24;

const optionIdsMatching = (facets: Facet<ProjectCardData>[], key: string, slugValue: string | null) => {
  if (!slugValue) return [];
  const facet = facets.find((f) => f.key === key);
  const slugs = key === 'area' ? areaSlugs(slugValue) : [slugValue];
  return (facet?.options ?? []).filter((o) => slugs.includes(toSlug(o.label)) || o.id === slugValue).map((o) => o.id);
};

/**
 * Turns the hero / Section 02 search query string into a starting selection:
 * ?q=dubai-marina&beds=2&min=2000000&max=5000000&handover=2028&type=villa, or ?area=jvc / ?developer=emaar
 */
function selectionFromParams(facets: Facet<ProjectCardData>[], params: URLSearchParams): Selection {
  const q = params.get('q');
  const handover = params.get('handover');
  const min = Number(params.get('min')) || undefined;
  const max = Number(params.get('max')) || undefined;

  const handoverYears = facets.find((f) => f.key === 'handover')?.options.map((o) => o.id) ?? [];

  return {
    /* ?area= and ?developer= pick only that filter: a few developers share a name with an area */
    area: optionIdsMatching(facets, 'area', params.get('area') ?? (params.get('developer') ? null : q)),
    developer: optionIdsMatching(facets, 'developer', params.get('developer') ?? (params.get('area') ? null : q)),
    type: optionIdsMatching(facets, 'type', params.get('type')),
    beds: optionIdsMatching(facets, 'beds', params.get('beds')),
    price: priceSelection(min, max),
    handover:
      handover === '2029-plus'
        ? handoverYears.filter((y) => Number(y) >= 2029)
        : handoverYears.filter((y) => y === handover),
  };
}

type Props = {
  items: ProjectCardData[];
  defaultSort: DefaultSort;
  /** Tags every card NEW LAUNCH */
  isNew?: boolean;
  /** The all-projects page: adds the collection filter and applies the search query string */
  searchable?: boolean;
};

type ExplorerProps = Props & { itemFacets: Facet<ProjectCardData>[]; initialSelection?: Selection };

function Explorer({ items, itemFacets, defaultSort, isNew, initialSelection }: ExplorerProps) {
  return (
    <FilterExplorer
      items={items}
      facets={itemFacets}
      getKey={(p) => p.slug}
      renderItem={(p) => <ProjectCard project={p} isNew={isNew} />}
      noun={['project', 'projects']}
      initialSelection={initialSelection}
      sortOptions={sortOptionsFrom(defaultSort)}
      pageSize={PAGE_SIZE}
      emptyHint="Try removing a filter, or speak to a specialist about upcoming launches."
    />
  );
}

function ExplorerFromUrl(props: ExplorerProps) {
  const params = useSearchParams();
  /* Read once: later filter changes are the visitor's, not the URL's */
  const initial = useMemo(
    () => selectionFromParams(props.itemFacets, new URLSearchParams(params.toString())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return <Explorer {...props} initialSelection={initial} />;
}

/** The filterable grid of project cards. */
export default function ProjectGrid(props: Props) {
  const { items, searchable } = props;
  const itemFacets = useMemo(() => facetsFor(items, { withCollection: searchable }), [items, searchable]);
  const explorer = { ...props, itemFacets };
  if (!searchable) return <Explorer {...explorer} />;
  return (
    /* The static build renders the unfiltered grid; the URL's filters apply on load */
    <Suspense fallback={<Explorer {...explorer} />}>
      <ExplorerFromUrl {...explorer} />
    </Suspense>
  );
}
