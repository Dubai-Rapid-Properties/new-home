/**
 * What an off-plan project card, the project filters and the construction
 * tracker need, and nothing else. Client components import this, never
 * data/offPlan.ts: that module holds every project's full details (well over
 * a thousand projects), which would otherwise all be sent to the browser.
 */
import {
  asOptions,
  bedroomOptions,
  priceFacet,
  uniqueSorted,
  type Facet,
  type PriceBand,
} from '@/lib/filters';

export type ProjectType = 'Apartment' | 'Penthouse' | 'Townhouse' | 'Villa';

export type ProjectCardData = {
  slug: string;
  name: string;
  developer: string | null;
  area: string;
  collections: string[];
  propertyTypes: ProjectType[];
  bedrooms: number[];
  fromPrice: number | null;
  handoverYear: number | null;
  paymentPlan: string | null;
  launchedAt: string;
  image: string;
  alt: string;
};

export const projectHref = (slug: string) => `/off-plan/${slug}`;

export const formatAed = (n: number) => `AED ${n.toLocaleString('en-US')}`;

type Priced = Pick<ProjectCardData, 'fromPrice'>;

/** "AED 2,800,000", or "Price on request" when there is no confirmed price. */
export const priceLabel = (p: Priced) => (p.fromPrice == null ? 'Price on request' : formatAed(p.fromPrice));

export const handoverLabel = (p: Pick<ProjectCardData, 'handoverYear'>) =>
  p.handoverYear ? String(p.handoverYear) : 'TBC';

/** "Developer · Area", or just the area when the developer is not named. */
export const projectEyebrow = (p: Pick<ProjectCardData, 'developer' | 'area'>) =>
  p.developer ? `${p.developer} · ${p.area}` : p.area;

const bedLabel = (n: number) => (n === 0 ? 'Studio' : String(n));

/** "Studio – 2 Bed · Apartments" / "4 – 6 Bed · Villas" / "Apartments & Penthouses" */
export function unitTypesLabel(p: Pick<ProjectCardData, 'propertyTypes' | 'bedrooms'>): string {
  const types = p.propertyTypes.map((t) => `${t}s`).join(' & ');
  if (!p.bedrooms.length) return types;
  const min = Math.min(...p.bedrooms);
  const max = Math.max(...p.bedrooms);
  const beds = min === max ? (min === 0 ? 'Studio' : `${min} Bed`) : `${bedLabel(min)} – ${max} Bed`;
  return `${beds} · ${types}`;
}

/** Highest starting price first; projects priced on request go last. */
export const byPriceDesc = (a: Priced, b: Priced) => (b.fromPrice ?? -1) - (a.fromPrice ?? -1);

/** Construction stage named from site progress. */
export function constructionStage(progress: number) {
  if (progress >= 95) return 'Handover preparation';
  if (progress >= 75) return 'Finishing works';
  if (progress >= 40) return 'Superstructure';
  if (progress >= 15) return 'Substructure';
  return 'Enabling works';
}

/* -------------------------------------------------------------------------- */
/*  FILTERS                                                                   */
/* -------------------------------------------------------------------------- */

const bedroomFacet: Facet<ProjectCardData> = {
  key: 'beds',
  label: 'Bedrooms',
  options: bedroomOptions.map(({ id, label }) => ({ id, label })),
  test: (p, sel) => bedroomOptions.some((o) => sel.includes(o.id) && p.bedrooms.some(o.test)),
};

export const priceBands: PriceBand[] = [
  { id: 'under-2m', label: 'Under AED 2M', max: 2_000_000 },
  { id: '2m-5m', label: 'AED 2M – 5M', min: 2_000_000, max: 5_000_000 },
  { id: '5m-10m', label: 'AED 5M – 10M', min: 5_000_000, max: 10_000_000 },
  { id: '10m-up', label: 'AED 10M+', min: 10_000_000 },
];

/**
 * The filter bar for a set of projects; options come from those projects only.
 * The collection filter shows only on the all-projects page.
 */
export const facetsFor = (items: ProjectCardData[], { withCollection = false } = {}): Facet<ProjectCardData>[] => [
  {
    key: 'area',
    label: 'Area',
    options: asOptions(uniqueSorted(items.map((p) => p.area))),
    test: (p, sel) => sel.includes(p.area),
  },
  ...(withCollection
    ? [
        {
          key: 'collection',
          label: 'Collection',
          options: asOptions(uniqueSorted(items.flatMap((p) => p.collections))),
          test: (p: ProjectCardData, sel: string[]) => p.collections.some((c) => sel.includes(c)),
        },
      ]
    : []),
  {
    key: 'developer',
    label: 'Developer',
    options: asOptions(uniqueSorted(items.flatMap((p) => (p.developer ? [p.developer] : [])))),
    test: (p, sel) => !!p.developer && sel.includes(p.developer),
  },
  {
    key: 'type',
    label: 'Property Type',
    options: asOptions(uniqueSorted(items.flatMap((p) => p.propertyTypes))),
    test: (p, sel) => p.propertyTypes.some((t) => sel.includes(t)),
  },
  bedroomFacet,
  /* Projects priced on request match no price band */
  priceFacet<ProjectCardData>('Price Range', priceBands, (p) => p.fromPrice ?? NaN),
  {
    key: 'handover',
    label: 'Handover',
    options: asOptions(uniqueSorted(items.flatMap((p) => (p.handoverYear ? [String(p.handoverYear)] : [])))),
    test: (p, sel) => sel.includes(String(p.handoverYear)),
  },
];
