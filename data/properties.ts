/**
 * ============================================================================
 *  READY PROPERTIES — SALE + RENTAL LISTINGS
 * ============================================================================
 *  Drives /properties (Buy / Rent explorer), /properties/[slug] and the
 *  homepage "Selected Properties" tabs.
 * ============================================================================
 */

import {
  asOptions,
  bedroomOptions,
  priceFacet,
  uniqueSorted,
  type Facet,
  type PriceBand,
} from '@/lib/filters';
import { hotDeals } from './hotDeals';
import { licences } from './licences';
import type { ReadyProperty, RentalProperty } from './homepage';
import imported from './imported/listings.json';
import hiddenListings from './imported/hidden-listings.json';
import portal from './imported/portal-listings.json';

export type Offering = 'buy' | 'rent';
export type ListingType = 'Apartment' | 'Penthouse' | 'Townhouse' | 'Villa';
export type Furnishing = 'Furnished' | 'Unfurnished';
export type Completion = 'Ready' | 'Off-Plan';

export type Listing = {
  slug: string;
  /** Property Finder reference */
  ref: string;
  /** DLD advertising permit */
  permit: string | null;
  /** DLD (Trakheesi / Madmoun) page validating the permit, when Property Finder supplies one */
  permitUrl: string | null;
  title: string;
  offering: Offering;
  /** AED. Rentals are per year. */
  price: number;
  type: ListingType;
  /** Matched against /data/areas.ts so the area guide can list it. */
  area: string;
  /** The building or cluster the listing names, e.g. "Silverene Tower A" */
  building: string | null;
  /**
   * Google Maps search, checked at import; `exact` is false when it shows the community.
   * `near` is Property Finder's [lat, lng] for the building, so the search finds that building and not a namesake.
   */
  map: { query: string; exact: boolean; near?: [number, number] };
  /** 0 = studio */
  beds: number;
  baths: number;
  /** sq ft */
  size: number;
  completion: Completion;
  /** Only set when the listing says so. */
  furnishing: Furnishing | null;
  listedAt: string;
  /** The DRP agent handling the listing */
  agent: string | null;
  images: { src: string; alt: string }[];
  description: string[];
  features: string[];
  sourceUrl: string;
  /** Pinned first on /properties with a "Hot Deal" badge (data/hotDeals.ts) */
  hotDeal?: boolean;
  /** Where the card links instead of /properties/[slug], e.g. the deal's landing page */
  href?: string;
};

type ImportedListing = (typeof imported)[number];

/** Property Finder titles use a lower-case "l" as a separator. */
const cleanTitle = (t: string) => t.replace(/\s+l\s+/g, ' | ').replace(/\s*\|\s*$/, '').trim();

/** Only a Dubai Land Department address is trusted as a permit check. */
const dldUrl = (v: unknown) =>
  typeof v === 'string' && /^https:\/\/[^/]*dubailand\.gov\.ae\//i.test(v) ? v : null;

/**
 * A listing the portal copied from /pf-listings.json carries this site's cleaned
 * photos as full addresses (any of its domains); serve them as local files again.
 */
const localPhoto = (src: string) => src.replace(/^https?:\/\/[^/]+(?=\/media\/listings\/)/, '');

const toListing = (r: ImportedListing): Listing => {
  const title = cleanTitle(r.title);
  return {
    slug: r.slug,
    ref: r.ref ?? r.slug,
    /* The importer took DRP's trade licence for a permit on some listings; that is not a listing permit */
    permit: r.permit && r.permit !== licences.tradeLicence ? r.permit : null,
    permitUrl: dldUrl((r as { permitUrl?: unknown }).permitUrl),
    title,
    offering: r.offering as Offering,
    price: r.price,
    type: r.type as ListingType,
    area: r.area,
    building: r.building,
    map: { query: r.map.query, exact: r.map.exact, ...(r.map.near?.length === 2 && { near: [r.map.near[0], r.map.near[1]] as [number, number] }) },
    beds: r.beds ?? 0,
    baths: r.baths ?? 1,
    size: r.size ?? 0,
    completion: r.completion as Completion,
    furnishing: r.furnishing as Furnishing | null,
    listedAt: r.listedAt ?? '2026-01-01',
    agent: r.agent,
    images: r.images.map((src, i) => ({ src: localPhoto(src), alt: i === 0 ? title : `${title}, photo ${i + 1}` })),
    description: r.description,
    features: r.features,
    sourceUrl: r.sourceUrl,
  };
};

/**
 * Listings added in the D|R|P admin portal (Website -> Listings), written by
 * scripts/sync-listings.mjs before each build. Same shape as listings.json.
 */
const pfBySlug = new Map(imported.map((r) => [r.slug, r]));
/*
 * A copy taken over from Property Finder in the portal keeps Property Finder's
 * map pin (the portal does not store it) while its building is unchanged.
 */
const portalListings = (portal as unknown as ImportedListing[]).map((r) => {
  const pf = pfBySlug.get(r.slug);
  return !r.map?.near && pf?.map?.near && pf.building === r.building ? { ...r, map: { ...r.map, near: pf.map.near } } : r;
});
const portalSlugs = new Set(portalListings.map((r) => r.slug));
/* Property Finder listings hidden in the admin portal */
const hiddenSlugs = new Set<string>(hiddenListings);

/**
 * REAL – every DRP listing on Property Finder (listings.json, kept current by
 * scripts/sync-property-finder.mjs), plus the listings added in the admin
 * portal. A portal listing with the same web address as a Property Finder one
 * takes its place, and a hot deal (data/hotDeals.ts) replaces the listing it
 * shares a slug with. Commercial units are left out: the site covers homes
 * only. Newest first, after DRP's hot deals.
 */
const hotDealSlugs = new Set(hotDeals.map((l) => l.slug));

export const listings: Listing[] = [
  ...hotDeals,
  ...[...portalListings, ...imported.filter((r) => !portalSlugs.has(r.slug))]
    .filter((r) => !hotDealSlugs.has(r.slug) && !hiddenSlugs.has(r.slug))
    .filter((r) => r.type !== 'Commercial' && r.size)
    .map(toListing)
    .sort((a, b) => b.listedAt.localeCompare(a.listedAt)),
];

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                   */
/* -------------------------------------------------------------------------- */

export const listingHref = (slug: string) => `/properties/${slug}`;

/** "Silverene Tower A, Dubai Marina" — without repeating a community the building name already carries. */
export const listingPlace = (l: Listing) =>
  l.building && !l.building.toLowerCase().includes(l.area.toLowerCase()) ? `${l.building}, ${l.area}` : l.building ?? l.area;

/** The map's heading and its Google search, as checked by the importer. */
export const listingLocation = (l: Listing) => ({ label: listingPlace(l), ...l.map });
export const getListing = (slug: string) => listings.find((l) => l.slug === slug);

export const saleListings = listings.filter((l) => l.offering === 'buy');
export const rentListings = listings.filter((l) => l.offering === 'rent');

export const formatPrice = (l: Listing) => `AED ${l.price.toLocaleString('en-US')}`;
export const bedsLabel = (beds: number) => (beds === 0 ? 'Studio' : `${beds} BR`);
export const bedsLong = (beds: number) =>
  beds === 0 ? 'Studio' : `${beds} Bedroom${beds === 1 ? '' : 's'}`;

/** Similar listings: same offering, same area first, then same type. */
export function similarListings(l: Listing, count = 3) {
  const pool = listings.filter((x) => x.offering === l.offering && x.slug !== l.slug);
  const score = (x: Listing) => (x.area === l.area ? 2 : 0) + (x.type === l.type ? 1 : 0);
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, count);
}

/* -------------------------------------------------------------------------- */
/*  FILTERS                                                                   */
/* -------------------------------------------------------------------------- */

export const saleBands: PriceBand[] = [
  { id: 'under-2m', label: 'Under AED 2M', max: 2_000_000 },
  { id: '2m-5m', label: 'AED 2M – 5M', min: 2_000_000, max: 5_000_000 },
  { id: '5m-10m', label: 'AED 5M – 10M', min: 5_000_000, max: 10_000_000 },
  { id: '10m-up', label: 'AED 10M+', min: 10_000_000 },
];

export const rentBands: PriceBand[] = [
  { id: 'under-100k', label: 'Under AED 100K / yr', max: 100_000 },
  { id: '100k-200k', label: 'AED 100K – 200K / yr', min: 100_000, max: 200_000 },
  { id: '200k-350k', label: 'AED 200K – 350K / yr', min: 200_000, max: 350_000 },
  { id: '350k-up', label: 'AED 350K+ / yr', min: 350_000 },
];

function buildFacets(items: Listing[], bands: PriceBand[], suffix = ''): Facet<Listing>[] {
  return [
    {
      key: 'area',
      label: 'Area',
      options: asOptions(uniqueSorted(items.map((l) => l.area))),
      test: (l, sel) => sel.includes(l.area),
    },
    {
      key: 'type',
      label: 'Property Type',
      options: asOptions(uniqueSorted(items.map((l) => l.type))),
      test: (l, sel) => sel.includes(l.type),
    },
    {
      key: 'beds',
      label: 'Bedrooms',
      options: bedroomOptions.map(({ id, label }) => ({ id, label })),
      test: (l, sel) => bedroomOptions.some((o) => sel.includes(o.id) && o.test(l.beds)),
    },
    priceFacet<Listing>('Price Range', bands, (l) => l.price, suffix),
    {
      key: 'completion',
      label: 'Status',
      options: asOptions(uniqueSorted(items.map((l) => l.completion))),
      test: (l, sel) => sel.includes(l.completion),
    },
  ];
}

/** Module constants, so the explorer sees stable facets per tab. */
export const listingFacets: Record<Offering, Facet<Listing>[]> = {
  buy: buildFacets(saleListings, saleBands),
  rent: buildFacets(rentListings, rentBands, ' / yr'),
};


/* -------------------------------------------------------------------------- */
/*  CARD SHAPE                                                                */
/* -------------------------------------------------------------------------- */

/** Maps a listing onto the shared PropertyCard props (homepage + /properties). */
export function toPropertyCard(
  l: Listing,
): { kind: 'ready'; item: ReadyProperty } | { kind: 'rent'; item: RentalProperty } {
  const base = {
    id: l.slug,
    title: l.title,
    price: formatPrice(l),
    aed: l.price,
    type: l.type,
    location: l.area,
    beds: bedsLabel(l.beds),
    baths: `${l.baths} BA`,
    area: `${l.size.toLocaleString('en-US')} sq ft`,
    image: l.images[0].src,
    alt: l.images[0].alt,
    href: l.href ?? listingHref(l.slug),
    hot: l.hotDeal,
    document: Boolean(l.href?.startsWith('/')),
  };
  return l.offering === 'rent'
    ? { kind: 'rent', item: { ...base, period: '/ year', status: l.hotDeal ? 'Hot Deal' : 'For Rent' } }
    : { kind: 'ready', item: { ...base, status: l.hotDeal ? 'Hot Deal' : 'For Sale' } };
}

/** Wraps a sort so hot deals stay pinned first, whatever the order chosen. */
export const hotDealsFirst =
  (compare: (a: Listing, b: Listing) => number) =>
  (a: Listing, b: Listing) =>
    Number(Boolean(b.hotDeal)) - Number(Boolean(a.hotDeal)) || compare(a, b);

/** A listing with this many photos or more has a full gallery. */
const FULL_GALLERY = 6;

/**
 * Top Picks, the default order on /properties: listings with a full gallery
 * first, most expensive first, then the rest, most expensive first.
 */
export const byTopPicks = (a: Listing, b: Listing) =>
  Number(b.images.length >= FULL_GALLERY) - Number(a.images.length >= FULL_GALLERY) || b.price - a.price;

/**
 * The homepage's featured listings: the four most exclusive (highest priced)
 * with a full gallery, per tab. Everything else is under "View all".
 */
const featuredFour = (items: Listing[]) =>
  items
    .filter((l) => l.images.length >= 4)
    .sort(hotDealsFirst((a, b) => b.price - a.price))
    .slice(0, 4);
export const homepageSale = featuredFour(saleListings);
export const homepageRent = featuredFour(rentListings);
