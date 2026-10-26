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
  byPriceDesc,
  facetsFor,
  projectHref,
  type ProjectCardData,
  type ProjectType,
} from '@/lib/offPlanCards';
import importedConstruction from './imported/construction.json';
import dldConstruction from './market/construction.json';
import pfConstruction from './market/construction-pf.json';
import { curatedProjects } from './curatedProjects';
import importedProjects from './imported/projects.json';
import pfCatalog from './market/pf-projects.json';

export type { ProjectType };
export {
  byPriceDesc,
  constructionStage,
  facetsFor,
  formatAed,
  handoverLabel,
  priceBands,
  priceLabel,
  projectEyebrow,
  projectHref,
  unitTypesLabel,
} from '@/lib/offPlanCards';

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
  map: { query: string; exact: boolean; near?: [number, number] };
  sourceUrl: string;
  /**
   * Set on projects D|R|P has not listed itself, taken from Property Finder's
   * New Projects pages so the site covers every Dubai off-plan project.
   */
  catalog?: 'property-finder';
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
 * Developers the DRP website does not name on the project page (the importer
 * finds none in the text), by project slug. Checked October 2026 against the
 * developers' launch announcements and Property Finder.
 */
const DEVELOPER_CORRECTIONS: Record<string, string> = {
  'address-residences-zabeel': 'Emaar',
  'creek-waters-2': 'Emaar',
  'golf-trails': 'Emaar',
  hillsedge: 'Emaar',
  'ovelle-the-valley': 'Emaar',
  salva: 'Emaar',
  serro: 'Emaar',
  'cavalli-couture': 'DAMAC',
  'cavalli-tower': 'DAMAC',
  'design-quarter': 'Meraas',
  'jumeirah-asora-bay': 'Meraas',
  'the-edit-at-d3': 'Meraas',
  'palm-central-private-residences-phase-2': 'Nakheel',
  'the-wilds': 'Aldar',
  'casa-canal': 'AHS Properties',
  'eden-house-the-park': 'H&H',
  // Developed by H&H with Shamal Holding, Dubai Harbour's owner
  'dubai-harbour-residence': 'H&H',
  'alta-v1ew': 'Object 1',
  'elar1s-rise': 'Object 1',
  'w1nner-tower': 'Object 1',
  'mira-villas-by-bentley-home': 'MIRA Developments',
  'trussardi-residences-phase-two': 'MIRA Developments',
  'karl-lagerfeld-beach-residences': 'Aark Developers',
  'soma-residences': 'Origami Development',
  'vitalia-palm-jumeirah-residences': 'Pinnacle Developers',
  eywa: 'R.Evolution',
  'jacob-and-co-beachfront-living': 'Ohana Development',
  knightsbridge: 'LEOS Developments',
  'mr-c-residences-downtown': 'Alta Real Estate Development',
  'terra-golf-collection-phase-2': 'Taraf',
  'beverly-crown': 'HMB Homes',
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
const drpProjects: Project[] = importedProjects
  .filter((r) => r.startingPrice)
  .map((r): Project => ({
    slug: r.slug,
    name: r.name,
    developer: r.developer ?? DEVELOPER_CORRECTIONS[r.slug] ?? null,
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
/*  EVERY OTHER DUBAI PROJECT (Property Finder)                               */
/* -------------------------------------------------------------------------- */

type PfProject = (typeof pfCatalog.projects)[number];

/** Property Finder's developer names, as the site names the developers */
const PF_DEVELOPERS: Record<string, string> = {
  'Emaar Properties': 'Emaar',
  'Damac Properties': 'DAMAC',
  'Azizi Developments': 'Azizi',
  'Binghatti Developers': 'Binghatti',
  'Meraas Holding': 'Meraas',
  'Samana Developers': 'Samana',
  'Aldar Properties PJSC': 'Aldar',
  'Imtiaz Developments': 'Imtiaz',
  'Danube Properties': 'Danube',
  'Wasl Properties': 'Wasl',
  'H&H Development': 'H&H',
  'Omniyat Group': 'OMNIYAT',
  ARADA: 'Arada',
  'Reportage Real Estate': 'Reportage',
  'Acube Developers': 'Acube Developments',
  'Chaimaa Holding Limited': 'Chaimaa Holding',
  'Mr Eight Development': 'Mr. Eight Development',
  'Mira Developments': 'MIRA Developments',
  'Zoya Developments': 'Zoya',
  'Sol Properties': 'SOL Properties',
  'Origami Developer': 'Origami Development',
  Darglobal: 'Dar Global',
  'R. Evolution': 'R.Evolution',
  'Amis properties': 'AMIS Development',
  'LEOS International': 'LEOS Developments',
  'Swank Developments': 'Swank Development',
  'Taraf Properties': 'Taraf',
  'HMB Properties': 'HMB Homes',
  'H M B Development': 'HMB Homes',
  'Valores Property Development': 'Valores',
  'Evera Real Estate': 'Evera Development',
  'Pantheon Development': 'Pantheon',
  'Peace Homes Group': 'Peace Homes',
};

/** Property Finder's community names, as the site's areas are named */
const PF_AREAS: Record<string, string> = {
  'Jumeirah Village Circle': 'JVC',
  'Dubai South (Dubai World Central)': 'Dubai South',
  'Dubai Land Residence Complex': 'Dubailand',
  'Dubai Land': 'Dubailand',
  'Maritime City': 'Dubai Maritime City',
  'International City Phase 2 (Al Warsan 4)': 'Warsan 4',
  'The Heights Country Club & Wellness': 'The Heights',
  'DAMAC Sun City': 'Damac Suncity',
  'Liwan 2': 'Liwan',
};
const pfArea = (community: string | null) =>
  community ? (PF_AREAS[community] ?? community.replace(/\s*\([^)]*\)$/, '')) : 'Dubai';

const PF_TYPES: [RegExp, ProjectType][] = [
  [/penthouse/, 'Penthouse'],
  [/town ?house/, 'Townhouse'],
  [/villa|bungalow|mansion|compound/, 'Villa'],
  [/apartment|duplex|loft|studio|residential/, 'Apartment'],
];
const pfTypes = (types: string[]): ProjectType[] => [
  ...new Set(types.flatMap((t) => PF_TYPES.filter(([re]) => re.test(t.replace(/_/g, ' '))).map(([, type]) => type).slice(0, 1))),
];

/** A name as the matcher compares it: W1NNER = Winner, "X by Binghatti" = "X", "Phase 2" = "2" */
const matchName = (name: string) =>
  name
    .toLowerCase()
    .replace(/(?<=[a-z])1(?=[a-z])/g, 'i')
    .replace(/(?<=[a-z])0(?=[a-z])/g, 'o')
    .replace(/\s+by\s+.*$/, '')
    .replace(/\bphase\s*/g, '')
    .replace(/[^a-z0-9]/g, '');

/**
 * Property Finder projects never shown on the site, by page path: their
 * developer asked for them to be taken down (not yet approved for
 * advertising). The weekly refresh keeps them in pf-projects.json; this keeps
 * them off the site.
 */
const PF_REMOVED = new Set([
  'acube-developers/zeta', // Acube Developments, 26 Oct 2026: not yet approved for advertising
]);

/** Property Finder pages for projects D|R|P lists under another name, by page path */
const PF_LISTED_BY_DRP = new Set([
  'object-1/alta-view-skyhomes',
  'emaar-properties/ovelle',
  'emaar-properties/parkwood',
  'emaar-properties/salva-by-emaar',
  'emaar-properties/serro-the-heights',
  'emaar-properties/valia-tower',
  'origami-developer/soma-residence',
  'danube-properties/aspirz',
  'damac-properties/chelsea-residences',
  'damac-properties/damac-islands',
  'damac-properties/damac-islands-phase-2',
]);

const yearOf = (iso: string | null) => (iso ? Number(iso.slice(0, 4)) : null);

/** The data file keeps only each photo's key (scripts/sync-pf-projects.mjs) */
const pfImage = (id: string, key: string) =>
  key.startsWith('https://') ? key : `https://new-projects-media.propertyfinder.com/project/${id}/gallery/image/${key}/medium.webp`;

function fromPropertyFinder(r: PfProject, slug: string): Project | null {
  const propertyTypes = pfTypes(r.propertyTypes);
  const images = r.images.map((key) => pfImage(r.id, key));
  /* Offices, shops and plots are not homes */
  if (!propertyTypes.length || !images.length) return null;
  const developer = r.developer ? (PF_DEVELOPERS[r.developer] ?? r.developer) : null;
  const area = pfArea(r.community);
  const where = r.subCommunity && r.subCommunity !== r.name ? `${r.subCommunity}, ${area}` : area;
  const handoverYear = yearOf(r.deliveryDate);
  const fromPrice = r.startingPrice || null;
  const highlights = [
    handoverYear ? { title: `Handover ${handoverYear}`, text: `Expected completion in ${handoverYear}, as the developer publishes it.` } : null,
    r.paymentPlan ? { title: `${r.paymentPlan} Plan`, text: `${r.paymentPlan.split('/')[0]}% before handover and ${r.paymentPlan.split('/')[1]}% on and after handover.` } : null,
    fromPrice ? { title: 'Starting Price', text: `Homes from AED ${fromPrice.toLocaleString('en-US')}.` } : null,
    r.amenities.length ? { title: 'Amenities', text: `${r.amenities.slice(0, 4).join(', ')}.` } : null,
  ].filter((h): h is { title: string; text: string } => h !== null);
  return {
    slug,
    name: r.name,
    developer,
    area,
    collections: withPriceCollections([], fromPrice),
    propertyTypes,
    bedrooms: r.bedrooms,
    fromPrice,
    handoverYear,
    paymentPlan: r.paymentPlan,
    launchedAt: r.salesStart ?? '',
    description: r.description.length
      ? r.description
      : [`${r.name} is an off-plan project${developer ? ` by ${developer}` : ''} in ${where}, Dubai.`],
    highlights,
    locationText: [`${r.name} is in ${where}, Dubai.`],
    image: images[0],
    alt: `${r.name}, ${area}`,
    gallery: images.map((src, i) => ({ src, alt: `${r.name}, image ${i + 1}` })),
    map:
      r.lat != null && r.lng != null
        ? { query: `${r.name}, ${area}, Dubai`, exact: true, near: [r.lat, r.lng] }
        : { query: `${r.name}, ${area}, Dubai`, exact: false },
    sourceUrl: `https://www.propertyfinder.ae/en/new-projects/${r.path}`,
    catalog: 'property-finder',
  };
}

type Inspection = { progress: number; inspected: string };

/** Property Finder's latest site inspection for each of those projects, by slug */
const pfInspections = new Map<string, Inspection>();
/** ...and for every Dubai project it lists, D|R|P's own included, by name */
const pfInspectionsByName = new Map<string, Inspection>(
  pfCatalog.projects.flatMap((r) =>
    r.progress != null && r.inspected ? [[matchName(r.name), { progress: r.progress, inspected: r.inspected }] as const] : [],
  ),
);

/** Property Finder's projects that D|R|P does not already list, with slugs unique on the site */
const pfProjects: Project[] = (() => {
  const listed = new Set(drpProjects.map((p) => matchName(p.name)));
  const slugs = new Set(drpProjects.map((p) => p.slug));
  const out: Project[] = [];
  for (const r of pfCatalog.projects) {
    if (PF_REMOVED.has(r.path) || PF_LISTED_BY_DRP.has(r.path) || listed.has(matchName(r.name))) continue;
    const [devSlug, projectSlug] = r.path.split('/');
    const slug = slugs.has(projectSlug) ? `${projectSlug}-${devSlug}` : projectSlug;
    if (slugs.has(slug)) continue;
    const project = fromPropertyFinder(r, slug);
    if (!project) continue;
    slugs.add(slug);
    listed.add(matchName(r.name));
    out.push(project);
    if (r.progress != null && r.inspected) pfInspections.set(slug, { progress: r.progress, inspected: r.inspected });
  }
  return out;
})();

/** Every off-plan project on the site: D|R|P's own, then the rest of Dubai's. */
export const projects: Project[] = [...drpProjects, ...pfProjects].sort((a, b) =>
  b.launchedAt.localeCompare(a.launchedAt),
);

/* -------------------------------------------------------------------------- */
/*  CONSTRUCTION UPDATES                                                      */
/* -------------------------------------------------------------------------- */

export type ConstructionUpdate = {
  id: string;
  name: string;
  area: string;
  /** Site progress, 0–100, at the latest inspection; null until one is published */
  progress: number | null;
  image: string;
  /** Date of that figure; null with it */
  updated: string | null;
  /** The project page, when DRP also sells the project */
  href: string | null;
  /** Shown instead of progress while none is published */
  handoverYear: number | null;
  /** When DRP published the project; the newest lead the tracker */
  launchedAt: string | null;
};

/** An update with a published figure, as project pages show it */
export type ReportedUpdate = ConstructionUpdate & { progress: number; updated: string };
const isReported = (c: ConstructionUpdate): c is ReportedUpdate => c.progress != null && c.updated != null;

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

type DldProgress = { progress: number; inspected: string | null; dld: number[] };
/** REAL – DLD's latest inspection figures, by site name (scripts/sync-construction.mjs) */
const dldProgress = dldConstruction.projects as Record<string, DldProgress>;
/** REAL – Property Finder's figures for projects DLD's open data does not cover, by slug */
const pfProgress = pfConstruction as unknown as Record<string, { progress: number; inspected: string; source: string }>;
const sameDldProject = (a: string, b: string) =>
  dldProgress[a]?.dld.some((n) => dldProgress[b]?.dld.includes(n)) ?? false;

/**
 * REAL – DRP's construction updates, imported with the projects, plus every
 * other project on the site. Each shows the figure from its latest site
 * inspection, whichever of DLD, Property Finder and DRP's reports has it;
 * DRP's own projects with none yet show their handover year instead.
 */
/**
 * Names the construction reports use for a project that DRP lists under
 * another name, or that the reports list twice under two names.
 */
const TRACKER_NAMES: Record<string, string> = {
  'Winner Tower': 'W1NNER Tower',
  'Alta View Skyhomes': 'ALTA V1EW',
  'Elaris Rise': 'ELAR1S Rise',
  Altai: 'Altai Tower',
  'Mercedes Benz': 'Mercedes Benz Places',
  'Liv Maritime Dubai': 'Liv Maritime',
  Celestara: 'Celestara Residences',
};

const reported = importedConstruction
  .filter((c) => c.progress != null && c.updated)
  .map((c) => ({ ...c, siteName: c.name, name: TRACKER_NAMES[c.name] ?? c.name }))
  /* Reports repeat a project month to month; keep its latest figure */
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .filter((c, i, all) => all.findIndex((x) => normalise(x.name) === normalise(c.name)) === i);

const inspectionOf = (d: DldProgress | undefined): Inspection | undefined =>
  d?.inspected ? { progress: d.progress, inspected: d.inspected } : undefined;

/** Of DLD's, Property Finder's and D|R|P's own figures, the one from the latest site inspection */
const latestInspection = (...figures: (Inspection | undefined)[]) =>
  figures
    .filter((f): f is Inspection => !!f?.inspected && f.progress != null)
    .sort((a, b) => b.inspected.localeCompare(a.inspected))[0];

/** When the figures were last checked against DLD and Property Finder (every Monday, and before builds) */
export const trackerCheckedOn = [pfCatalog.synced, dldConstruction.updatedAt.slice(0, 10)].sort().reverse()[0];

export const constructionUpdates: ConstructionUpdate[] = [
  ...reported.map((c) => {
    const match = projects.find((p) => matchName(p.name) === matchName(c.name) || sameDldProject(p.name, c.name));
    const figure = latestInspection(
      inspectionOf(dldProgress[c.siteName]),
      pfInspectionsByName.get(matchName(c.name)),
      { progress: c.progress, inspected: c.updated },
    );
    return {
      id: c.id,
      name: c.name,
      area: c.area,
      progress: figure?.progress ?? null,
      image: c.image,
      updated: figure?.inspected ?? null,
      href: match ? `/off-plan/${match.slug}` : null,
      handoverYear: match?.handoverYear ?? null,
      launchedAt: match?.launchedAt ?? null,
    };
  }),
  /*
   * Every other project on the site: DLD's figure, else Property Finder's. D|R|P's
   * own projects show without one too (their handover year until it is published);
   * the rest of Dubai's only once a figure is published.
   */
  ...projects
    .filter((p) => !p.catalog || pfInspections.has(p.slug) || dldProgress[p.name]?.inspected)
    .filter((p) => !reported.some((c) => matchName(c.name) === matchName(p.name) || sameDldProject(p.name, c.name)))
    .map((p) => {
      const figure = latestInspection(
        inspectionOf(dldProgress[p.name]),
        pfProgress[p.slug],
        pfInspections.get(p.slug),
        pfInspectionsByName.get(matchName(p.name)),
      );
      return {
        id: p.slug,
        name: p.name,
        area: p.area,
        progress: figure?.progress ?? null,
        image: p.image,
        updated: figure?.inspected ?? null,
        href: `/off-plan/${p.slug}`,
        handoverYear: p.handoverYear,
        launchedAt: p.launchedAt,
      };
    }),
].sort(
  (a, b) =>
    /* DRP's projects, newest launch first, then the rest; most advanced first within each */
    (b.launchedAt ?? '').localeCompare(a.launchedAt ?? '') ||
    (b.progress ?? -1) - (a.progress ?? -1) ||
    (a.handoverYear ?? 9999) - (b.handoverYear ?? 9999) ||
    a.name.localeCompare(b.name),
);

export const constructionFor = (p: Project) =>
  constructionUpdates.filter(isReported).find((c) => c.href === `/off-plan/${p.slug}`);

/* -------------------------------------------------------------------------- */
/*  DERIVED LISTS + FORMATTING                                                */
/* -------------------------------------------------------------------------- */


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

/** The homepage's off-plan tab: the four most exclusive Luxury projects, highest starting price first. */
export const featuredProjects = projects
  .filter((p) => p.collections.includes('Luxury'))
  .sort(byPriceDesc)
  .slice(0, 4);

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
/*  DETAIL HELPERS                                                            */
/* -------------------------------------------------------------------------- */

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** What a project card and the filters need: client components get only this. */
export const toCard = (p: Project): ProjectCardData => ({
  slug: p.slug,
  name: p.name,
  developer: p.developer,
  area: p.area,
  collections: p.collections,
  propertyTypes: p.propertyTypes,
  bedrooms: p.bedrooms,
  fromPrice: p.fromPrice,
  handoverYear: p.handoverYear,
  paymentPlan: p.paymentPlan,
  launchedAt: p.launchedAt,
  image: p.image,
  alt: p.alt,
});

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
      intro: 'Every off-plan project in Dubai, with filters for area, developer, budget and handover.',
      image: '/images/off-plan/hero.webp',
      imageAlt: 'A penthouse terrace overlooking the Dubai skyline at dusk',
    },
  },
};
