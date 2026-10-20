/**
 * ============================================================================
 *  OFF-PLAN — PROJECT DATA + FILTER DEFINITIONS
 * ============================================================================
 *  Drives the off-plan section, laid out like the current DRP website:
 *    /off-plan                          choose: launches, collections, tracker
 *    /off-plan/latest-launches          DRP's "Latest Launch" projects
 *    /off-plan/collections              the investment collections
 *    /off-plan/collections/[slug]       one collection's projects
 *    /off-plan/projects                 every project, searchable (hero search)
 *  plus the homepage's off-plan tab and the /off-plan/[slug] project pages.
 *  Filter options are derived from each page's projects, so adding a project
 *  with a new area or developer adds it to the filter bar automatically.
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
import importedConstruction from './imported/construction.json';
import dldConstruction from './market/construction.json';
import { curatedProjects } from './curatedProjects';
import importedProjects from './imported/projects.json';

export type ProjectType = 'Apartment' | 'Penthouse' | 'Townhouse' | 'Villa';

export type Project = {
  slug: string;
  name: string;
  /** Null when the DRP project page does not name the developer. */
  developer: string | null;
  area: string;
  /** DRP's own collections, e.g. "Luxury", "Latest Launch". */
  collections: string[];
  propertyTypes: ProjectType[];
  /** Bedroom configurations on offer. 0 = studio. Empty when not stated. */
  bedrooms: number[];
  /** Starting price in AED; null shows "Price on request". */
  fromPrice: number | null;
  /** Expected handover year; null until the developer confirms it. */
  handoverYear: number | null;
  /** During construction / on handover, e.g. "60/40". Null when not published. */
  paymentPlan: string | null;
  /** Date DRP published the project. The newest launches lead the carousel. */
  launchedAt: string;
  description: string[];
  highlights: { title: string; text: string }[];
  locationText: string[];
  image: string;
  alt: string;
  gallery: { src: string; alt: string }[];
  /** Google Maps search, checked at import; `exact` is false when it shows the community */
  map: { query: string; exact: boolean };
  sourceUrl: string;
};

/** WordPress collection names, tidied for the filter bar. */
const COLLECTION_LABELS: Record<string, string> = {
  'Investment Collection': 'Investment',
  'Luxury Collection': 'Luxury',
  'Best roi & Capital Growth Projects)': 'Best ROI & Capital Growth',
  'Best Projects Under AED 1.5M': 'Under AED 1.5M',
  'Best Affordable Townhouse & Villa Projects': 'Affordable Townhouses & Villas',
  'Latest Launch': 'Latest Launch',
};

/**
 * Starting prices the DRP website has wrong, by project slug. A number replaces
 * the imported price; null shows "Price on request" until DRP confirms one.
 */
const PRICE_CORRECTIONS: Record<string, number | null> = {
  // CONFIRM – the DRP site says AED 1.35M, but Cavalli Couture is 3–6 bed
  // residences selling from roughly AED 16.5M; set the confirmed price here
  'cavalli-couture': null,
  // DRP confirmed AED 1.1M; the DRP site still says AED 1.05M
  diamondz: 1_100_000,
};

/**
 * The DRP website tags only some of its cheaper projects "Under AED 1.5M", so
 * every project whose starting price is below AED 1.5M joins that collection.
 */
const UNDER_1_5M = 'Under AED 1.5M';
const withPriceCollections = (collections: string[], fromPrice: number | null) =>
  fromPrice != null && fromPrice < 1_500_000 && !collections.includes(UNDER_1_5M)
    ? [...collections, UNDER_1_5M]
    : collections;

/**
 * REAL – the off-plan projects on the current DRP website, imported by
 * `npm run import:drp` (see scripts/import-drp-content.mjs). Payment plans are
 * not published there, so cards show them only once the data includes one.
 */
export const projects: Project[] = importedProjects
  .filter((r) => r.startingPrice)
  .map((r): Project => ({
    slug: r.slug,
    name: r.name,
    developer: r.developer,
    area: r.area,
    collections: withPriceCollections(
      r.collections.map((c) => COLLECTION_LABELS[c] ?? c),
      r.slug in PRICE_CORRECTIONS ? PRICE_CORRECTIONS[r.slug] : r.startingPrice!,
    ),
    propertyTypes: r.propertyTypes as ProjectType[],
    bedrooms: r.bedrooms,
    fromPrice: r.slug in PRICE_CORRECTIONS ? PRICE_CORRECTIONS[r.slug] : r.startingPrice!,
    handoverYear: r.handoverYear,
    paymentPlan: r.paymentPlan as string | null,
    launchedAt: r.launchedAt,
    description: r.about.length ? r.about : [r.summary],
    highlights: r.highlights,
    locationText: r.locationText,
    image: r.image!,
    alt: `${r.name}, ${r.area}`,
    gallery: r.gallery.map((src, i) => ({ src, alt: `${r.name}, image ${i + 1}` })),
    map: r.map,
    sourceUrl: r.sourceUrl,
  }))
  /* Projects D|R|P added by hand, unless the DRP website now has them too */
  .concat(curatedProjects.filter((c) => !importedProjects.some((r) => r.slug === c.slug)))
  .sort((a, b) => b.launchedAt.localeCompare(a.launchedAt));

/* -------------------------------------------------------------------------- */
/*  CONSTRUCTION UPDATES                                                      */
/* -------------------------------------------------------------------------- */

export type ConstructionUpdate = {
  id: string;
  name: string;
  area: string;
  /** Site progress, 0–100, as reported by the developer */
  progress: number;
  image: string;
  updated: string;
  /** The project page, when DRP also sells the project */
  href: string | null;
};

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

type DldProgress = { progress: number; inspected: string | null; dld: number[] };
/** REAL – DLD's latest inspection figures, by site name (scripts/sync-construction.mjs) */
const dldProgress = dldConstruction.projects as Record<string, DldProgress>;
const sameDldProject = (a: string, b: string) =>
  dldProgress[a]?.dld.some((n) => dldProgress[b]?.dld.includes(n)) ?? false;

/**
 * REAL – DRP's construction updates, imported with the projects, with DLD's
 * newer figures where DLD reports the project, plus the projects DRP sells
 * that DLD reports and the updates do not cover.
 */
const reported = importedConstruction
  .filter((c) => c.progress != null && c.updated)
  /* Reports repeat a project month to month; keep its latest figure */
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .filter((c, i, all) => all.findIndex((x) => normalise(x.name) === normalise(c.name)) === i);

export const constructionUpdates: ConstructionUpdate[] = [
  ...reported.map((c) => {
    const match = projects.find((p) => normalise(p.name) === normalise(c.name) || sameDldProject(p.name, c.name));
    const dld = dldProgress[c.name];
    return {
      id: c.id,
      name: c.name,
      area: c.area,
      progress: dld?.progress ?? c.progress,
      image: c.image,
      updated: dld?.inspected ?? c.updated,
      href: match ? `/off-plan/${match.slug}` : null,
    };
  }),
  ...projects
    .filter(
      (p) =>
        dldProgress[p.name]?.inspected &&
        !reported.some((c) => normalise(c.name) === normalise(p.name) || sameDldProject(p.name, c.name)),
    )
    .map((p) => ({
      id: `dld-${dldProgress[p.name].dld[0]}`,
      name: p.name,
      area: p.area,
      progress: dldProgress[p.name].progress,
      image: p.image,
      updated: dldProgress[p.name].inspected!,
      href: `/off-plan/${p.slug}`,
    })),
].sort((a, b) => b.progress - a.progress || a.name.localeCompare(b.name));

export const constructionFor = (p: Project) =>
  constructionUpdates.find((c) => c.href === `/off-plan/${p.slug}`);

/* -------------------------------------------------------------------------- */
/*  DERIVED LISTS + FORMATTING                                                */
/* -------------------------------------------------------------------------- */

export const projectHref = (slug: string) => `/off-plan/${slug}`;

/* Communities DRP sells in outside Dubai */
const EMIRATE: Record<string, string> = {
  'Al Marjan Island': 'Ras Al Khaimah',
  'Ghadeer Al Tayr': 'Abu Dhabi',
};

/** The map's heading and its Google search, as checked by the importer. */
export function projectLocation(p: Project) {
  const where = EMIRATE[p.area] ? `${p.area}, ${EMIRATE[p.area]}` : p.area;
  return { label: p.map.exact ? `${p.name}, ${where}` : where, ...p.map };
}

/** DRP's "Latest Launch" collection, newest first. */
export const latestLaunches = projects.filter((p) => p.collections.includes('Latest Launch'));

/** Highest starting price first; projects priced on request go last. */
export const byPriceDesc = (a: Project, b: Project) => (b.fromPrice ?? -1) - (a.fromPrice ?? -1);

/** The homepage's off-plan tab: the four most exclusive Luxury projects, highest starting price first. */
export const featuredProjects = projects
  .filter((p) => p.collections.includes('Luxury'))
  .sort(byPriceDesc)
  .slice(0, 4);

export const formatAed = (n: number) => `AED ${n.toLocaleString('en-US')}`;

/** "AED 2,800,000", or "Price on request" when DRP has no confirmed price. */
export const priceLabel = (p: Project) => (p.fromPrice == null ? 'Price on request' : formatAed(p.fromPrice));

export const handoverLabel = (p: Project) => (p.handoverYear ? String(p.handoverYear) : 'TBC');

/** "Developer · Area", or just the area when the developer is not named. */
export const projectEyebrow = (p: Project) => (p.developer ? `${p.developer} · ${p.area}` : p.area);

const bedLabel = (n: number) => (n === 0 ? 'Studio' : String(n));

/** "Studio – 2 Bed · Apartments" / "4 – 6 Bed · Villas" / "Apartments & Penthouses" */
export function unitTypesLabel(p: Project): string {
  const types = p.propertyTypes.map((t) => `${t}s`).join(' & ');
  if (!p.bedrooms.length) return types;
  const min = Math.min(...p.bedrooms);
  const max = Math.max(...p.bedrooms);
  const beds =
    min === max
      ? min === 0
        ? 'Studio'
        : `${min} Bed`
      : `${bedLabel(min)} – ${max} Bed`;
  return `${beds} · ${types}`;
}

/* -------------------------------------------------------------------------- */
/*  INVESTMENT COLLECTIONS                                                    */
/* -------------------------------------------------------------------------- */

export type OffPlanCollection = {
  slug: string;
  /** The project collection label it lists (see COLLECTION_LABELS) */
  collection: string;
  title: string;
  description: string;
  /** REAL – the collection images from the current DRP website */
  image: string;
  alt: string;
  projects: Project[];
};

const collection = (c: Omit<OffPlanCollection, 'projects'>): OffPlanCollection => ({
  ...c,
  projects: projects.filter((p) => p.collections.includes(c.collection)),
});

/** The four collections of /off-plan/collections, in the DRP website's order. */
export const offPlanCollections: OffPlanCollection[] = [
  collection({
    slug: 'luxury',
    collection: 'Luxury',
    title: 'Luxury Collection',
    description: "Dubai's finest properties offering exclusive design, prime locations and world-class living.",
    image: '/images/luxury.webp',
    alt: 'A sea-view terrace with a private pool',
  }),
  collection({
    slug: 'townhouses-villas',
    collection: 'Affordable Townhouses & Villas',
    title: 'Best Affordable Townhouse & Villa Projects',
    description: 'Spacious homes in vibrant communities, perfect for families and long-term living.',
    image: '/images/villa.jpg',
    alt: 'Villas around a lagoon in a new Dubai community',
  }),
  collection({
    slug: 'roi-growth',
    collection: 'Best ROI & Capital Growth',
    title: 'Best ROI & Growth Projects',
    description: 'Projects selected for their high growth potential, rental demand and long-term returns.',
    image: '/images/luxury1.jpg',
    alt: 'A balcony pool overlooking the sea',
  }),
  collection({
    slug: 'under-aed-1-5m',
    collection: 'Under AED 1.5M',
    title: 'Best Projects Under AED 1.5M',
    description: 'High-quality properties with great value and strong investment potential.',
    image: '/images/million.jpg',
    alt: 'A furnished living and dining room',
  }),
];

export const getCollection = (slug: string) => offPlanCollections.find((c) => c.slug === slug);
export const collectionHref = (slug: string) => `/off-plan/collections/${slug}`;

/** Hand-picked signature projects, shown on /off-plan/collections as on the DRP website. */
export const signatureProjects = [
  'orla-dorchester-collection',
  'bugatti-residences-by-binghatti',
  'cavalli-couture',
  'mira-villas-by-bentley-home',
].flatMap((slug) => projects.filter((p) => p.slug === slug));

/* -------------------------------------------------------------------------- */
/*  FILTERS                                                                   */
/* -------------------------------------------------------------------------- */

const bedroomFacet: Facet<Project> = {
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
export const facetsFor = (items: Project[], { withCollection = false } = {}): Facet<Project>[] => [
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
          test: (p: Project, sel: string[]) => p.collections.some((c) => sel.includes(c)),
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
  priceFacet<Project>('Price Range', priceBands, (p) => p.fromPrice ?? NaN),
  {
    key: 'handover',
    label: 'Handover',
    options: asOptions(uniqueSorted(items.flatMap((p) => (p.handoverYear ? [String(p.handoverYear)] : [])))),
    test: (p, sel) => sel.includes(String(p.handoverYear)),
  },
];

export const facets = facetsFor(projects, { withCollection: true });

/* -------------------------------------------------------------------------- */
/*  DETAIL HELPERS                                                            */
/* -------------------------------------------------------------------------- */

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Construction stage named from site progress. */
export function constructionStage(progress: number) {
  if (progress >= 95) return 'Handover preparation';
  if (progress >= 75) return 'Finishing works';
  if (progress >= 40) return 'Superstructure';
  if (progress >= 15) return 'Substructure';
  return 'Enabling works';
}

/** Same area or developer first. */
export function similarProjects(p: Project, count = 3) {
  const score = (x: Project) => (x.area === p.area ? 2 : 0) + (x.developer && x.developer === p.developer ? 1 : 0);
  return projects
    .filter((x) => x.slug !== p.slug)
    .sort((a, b) => score(b) - score(a) || b.launchedAt.localeCompare(a.launchedAt))
    .slice(0, count);
}

/* -------------------------------------------------------------------------- */
/*  SECTION PAGES (copy from the current DRP website)                         */
/* -------------------------------------------------------------------------- */

export const offPlanPages = {
  landing: {
    hero: {
      eyebrow: 'Our Projects',
      heading: "Explore Dubai's Best Off-Plan Projects",
      intro: 'Discover the latest launches, handpicked investment collections and real-time construction updates.',
      image: '/images/off-plan/hero.webp',
      imageAlt: 'A penthouse terrace overlooking the Dubai skyline at dusk',
    },
    chooseHeading: 'Choose What You Want to Explore',
    choices: [
      {
        title: 'Latest Launches',
        text: "Be the first to discover Dubai's newest off-plan projects and opportunities.",
        cta: 'Explore Latest Launches',
        href: '/off-plan/latest-launches',
        image: '/images/off-plan/card-latest-launches.webp',
        alt: 'A new sculptural tower lit at night',
      },
      {
        title: 'Investment Collections',
        text: 'Curated collections to help you find the right investment based on your goals.',
        cta: 'Explore Collections',
        href: '/off-plan/collections',
        image: '/images/off-plan/card-investment-collections.webp',
        alt: 'A terrace overlooking Downtown Dubai and the Burj Khalifa',
      },
      {
        title: 'Construction Tracker',
        text: 'Track progress and stay updated on your favourite projects.',
        cta: 'View Project Updates',
        href: '/off-plan/construction-tracker',
        image: '/images/off-plan/card-construction-tracker.webp',
        alt: 'Cranes over a tower under construction in Dubai',
      },
    ],
    benefits: [
      { title: 'Expert Advice', text: 'Get guidance from market experts.' },
      { title: 'Flexible Payment Plans', text: '1% monthly plans and post-handover options.' },
      { title: 'Trusted Developers', text: "Partnered with Dubai's leading developers." },
      { title: 'High ROI Potential', text: 'Maximise your returns with the right investment.' },
    ],
  },
  latestLaunches: {
    hero: {
      eyebrow: 'Off-Plan',
      heading: 'Latest Launches',
      intro: "Explore Dubai's newest off-plan projects and be the first to invest in tomorrow's most promising opportunities.",
      image: '/images/1414.jpeg',
      imageAlt: 'A new sculptural tower lit at night',
    },
  },
  collections: {
    hero: {
      eyebrow: 'Off-Plan',
      heading: 'Investment Collections',
      intro: 'Curated project collections to help you find the right investment based on your goals.',
      image: '/images/off-plan/card-investment-collections.webp',
      imageAlt: 'A terrace overlooking Downtown Dubai and the Burj Khalifa',
    },
    cta: {
      eyebrow: 'Not Sure Which Investment Is Right for You?',
      heading: 'Book a free consultation',
      text: 'Our property experts are here to understand your goals and recommend the perfect opportunities.',
    },
  },
  allProjects: {
    hero: {
      eyebrow: 'Off-Plan',
      heading: 'All Off-Plan Projects',
      intro: 'Every off-plan project D|R|P sells, with filters for area, developer, budget and handover.',
      image: '/images/off-plan/hero.webp',
      imageAlt: 'A penthouse terrace overlooking the Dubai skyline at dusk',
    },
  },
};
