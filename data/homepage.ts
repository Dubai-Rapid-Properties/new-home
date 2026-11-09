/**
 * ============================================================================
 *  DRP HOMEPAGE — SINGLE SOURCE OF CONTENT
 * ============================================================================
 *  Everything the client may want to change (copy, links, images, listings,
 *  articles, reviews, partners) lives in this file. No copy is hard-coded in
 *  components.
 *
 *  Items marked "DEMO PLACEHOLDER" must be replaced with real content before
 *  launch. Search this file for "DEMO PLACEHOLDER" to find them all.
 * ============================================================================
 */

import { featuredProjects, handoverLabel, priceLabel, projectHref, unitTypesLabel } from './offPlan';
import { HOLIDAY_HOMES_URL } from './external';
import { articleHref, articles, formatArticleDate } from './news';
import { homepageRent, homepageSale, toPropertyCard } from './properties';
import { dubaiAreas } from './dubaiAreas';

/** Helper so Unsplash URLs stay readable and consistently sized. */
const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/* -------------------------------------------------------------------------- */
/*  BRAND + CONTACT                                                           */
/* -------------------------------------------------------------------------- */

export const site = {
  name: 'Dubai Rapid Properties',
  shortName: 'D|R|P',
  established: 2007,
  tagline:
    'A Dubai real estate agency on Palm Jumeirah, connecting international clients with property, investment and opportunity across the UAE.',
  /* Kept in the repo so the logos survive the move off the WordPress site */
  logos: {
    white: '/brand/drp-white.svg',
    black: '/brand/drp-black.svg',
    favicon: '/icon.png',
  },
} as const;

export const contact = {
  addressLine: 'Golden Mile 9, Palm Jumeirah',
  addressFull: 'D|R|P, Golden Mile 9, Palm Jumeirah, Dubai',
  /** REAL – DRP's own Google Maps listing */
  mapHref: 'https://maps.app.goo.gl/7gaPDDcJJritEb746',
  /** Searches for the DRP listing itself (place 0x3e5f6be4264ce0bd:0x57c31faf4c750f69), not the building */
  mapEmbed:
    'https://www.google.com/maps?q=D|R|P+Dubai+Rapid+Properties,+Golden+Mile+9,+Palm+Jumeirah,+Dubai&z=17&output=embed',
  phone: '+971 4 529 4904',
  phoneHref: 'tel:+97145294904',
  whatsapp: '+971 56 777 0272',
  whatsappHref: 'https://wa.me/971567770272',
  email: 'Office@dubairapidproperties.com',
  emailHref: 'mailto:Office@dubairapidproperties.com',
} as const;

/* DRP's registration numbers live in ./licences, so data/properties.ts can read them too */
export { licences } from './licences';

/* -------------------------------------------------------------------------- */
/*  NAVIGATION                                                                */
/* -------------------------------------------------------------------------- */

export type NavItem = { label: string; href: string; external?: boolean };

/* Header navigation now lives in /data/navigation.ts (mega-menu structure). */

/* -------------------------------------------------------------------------- */
/*  SECTION 01 — HERO                                                         */
/* -------------------------------------------------------------------------- */

export const hero = {
  /** The small line above the name. */
  eyebrow: 'Dubai Real Estate. Global Perspective.',
  /** The large heading: the company's name. */
  heading: 'Dubai Rapid Properties',
  paragraph:
    'Established in Dubai since 2007, connecting clients from around the world with property, investment and opportunities across the UAE.',
  /** Background video — muted, looping, no controls. */
  videoSrc:
    'https://player.vimeo.com/video/1082800158?background=1&autoplay=1&loop=1&muted=1',
  /** Shown until the video paints, and on reduced-motion / no-video devices. */
  posterImage: unsplash('1546412414-e1885259563a', 2000),
  posterAlt: 'The Dubai coastline at dusk',
  quickLinks: [
    { label: 'About D|R|P', href: '/about' },
    { label: 'Find a Ready Property', href: '/properties' },
    { label: 'Explore Off Plan Investments', href: '/off-plan' },
    { label: 'Sell With D|R|P', href: '/list-your-property' },
    { label: 'Manage Your Home With D|R|P', href: '/property-management' },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/*  SEARCH — shared by the hero search and Section 02                          */
/* -------------------------------------------------------------------------- */
/*  Both search bars read areas, bedroom counts and price scales from here, so
    the two stay in step. Change a value once and it updates in both places.   */

export type Offering = 'buy' | 'rent' | 'offplan';

export type PriceOption = {
  value: number;
  label: string;
  /** The top option is open-ended ("50M+"), so no max is sent in the query. */
  open?: boolean;
};

/** A selectable range in the Section 02 dropdown, derived from the scale below. */
export type PriceBand = { id: string; label: string; min?: number; max?: number };

const salePrices: PriceOption[] = [
  { value: 500_000, label: '500K' },
  { value: 1_000_000, label: '1M' },
  { value: 1_500_000, label: '1.5M' },
  { value: 2_000_000, label: '2M' },
  { value: 3_000_000, label: '3M' },
  { value: 4_000_000, label: '4M' },
  { value: 5_000_000, label: '5M' },
  { value: 10_000_000, label: '10M' },
  { value: 20_000_000, label: '20M' },
  { value: 50_000_000, label: '50M+', open: true },
];

/** Yearly rent. */
const rentPrices: PriceOption[] = [
  { value: 50_000, label: '50K' },
  { value: 100_000, label: '100K' },
  { value: 150_000, label: '150K' },
  { value: 200_000, label: '200K' },
  { value: 250_000, label: '250K' },
  { value: 300_000, label: '300K' },
  { value: 500_000, label: '500K' },
  { value: 1_000_000, label: '1M+', open: true },
];

/**
 * Turns a price scale into consecutive bands for a single-select dropdown:
 * 500K–1M, 1M–2M, … 20M–50M, then an open "50M+" at the top.
 */
function buildPriceBands(options: PriceOption[], anyLabel: string): PriceBand[] {
  const bands: PriceBand[] = [{ id: 'any', label: anyLabel }];
  const clean = (label: string) => label.replace(/\+$/, '');

  for (let i = 0; i < options.length - 1; i += 1) {
    const from = options[i];
    const to = options[i + 1];
    bands.push({
      id: `${from.value}-${to.value}`,
      label: `AED ${clean(from.label)} – ${clean(to.label)}`,
      min: from.value,
      max: to.value,
    });
  }

  const top = options[options.length - 1];
  bands.push({ id: `${top.value}-up`, label: `AED ${clean(top.label)}+`, min: top.value });
  return bands;
}

export const searchData = {
  /** Areas offered as hero typeahead suggestions and in the Section 02 select: every Dubai area. */
  locations: dubaiAreas,

  propertyTypes: ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Plot', 'Commercial'],

  beds: ['Studio', '1', '2', '3', '4', '5+'],

  handover: ['Ready', '2026', '2027', '2028', '2029+'],

  salePrices,
  rentPrices,
  saleBands: buildPriceBands(salePrices, 'Any Price'),
  rentBands: buildPriceBands(rentPrices, 'Any Rent'),

  /** Where each offering sends the visitor on submit. */
  destinations: {
    buy: '/properties',
    rent: '/properties',
    offplan: '/off-plan/projects',
  } satisfies Record<Offering, string>,
};

/**
 * Section 02's search bar keeps four fields on every tab; only the third and
 * fourth change meaning with the offering.
 */
export const searchFields: Record<
  Offering,
  { thirdLabel: string; thirdOptions: string[]; thirdParam: string; priceLabel: string; bands: PriceBand[] }
> = {
  buy: {
    thirdLabel: 'Bedrooms',
    thirdOptions: searchData.beds,
    thirdParam: 'beds',
    priceLabel: 'Price Range',
    bands: searchData.saleBands,
  },
  rent: {
    thirdLabel: 'Bedrooms',
    thirdOptions: searchData.beds,
    thirdParam: 'beds',
    priceLabel: 'Rent (Yearly)',
    bands: searchData.rentBands,
  },
  offplan: {
    thirdLabel: 'Handover',
    thirdOptions: searchData.handover,
    thirdParam: 'handover',
    priceLabel: 'Starting Price',
    bands: searchData.saleBands,
  },
};

export const heroSearch = {
  tabs: [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' },
    { id: 'offplan', label: 'Off Plan' },
  ] satisfies { id: Offering; label: string }[],

  destinations: searchData.destinations,
  placeholder: 'Area, project or community',
  locations: searchData.locations,
  beds: searchData.beds,
  salePrices: searchData.salePrices,
  rentPrices: searchData.rentPrices,
};

/* -------------------------------------------------------------------------- */
/*  HERO MARQUEE — DEVELOPMENT PARTNERS                                       */
/* -------------------------------------------------------------------------- */

/**
 * DEMO PLACEHOLDER — partner logos.
 * These render as letter-spaced uppercase wordmarks for the demo.
 *
 * TO SWAP IN REAL LOGOS: drop monochrome white SVGs into /public/partners/
 * (e.g. /public/partners/emaar.svg) and set `logo` on the partner below.
 * PartnerMarquee renders `logo` as an <img> when present, otherwise the
 * `name` wordmark — no component changes needed.
 */
export type Partner = { name: string; logo?: string };

export const partners: Partner[] = [
  { name: 'Emaar' /* logo: '/partners/emaar.svg' */ },
  { name: 'Nakheel' },
  { name: 'Damac' },
  { name: 'Sobha' },
  { name: 'Ellington' },
  { name: 'Meraas' },
  { name: 'Omniyat' },
  { name: 'Binghatti' },
  { name: 'Select Group' },
  { name: 'Aldar' },
];

export const partnersLabel = 'Our Development Partners';

/* -------------------------------------------------------------------------- */
/*  SECTION 03 — SOLUTIONS (bento grid)                                       */
/* -------------------------------------------------------------------------- */

export type SolutionTile = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
  image?: string;
  alt?: string;
  /** CSS object-position for the photo, e.g. "50% 25%" to keep a sign in frame */
  imagePosition?: string;
  /** Layout span on the 4-column desktop bento grid. */
  span: 'large' | 'tall' | 'wide' | 'standard';
  /** Renders the charcoal editorial card instead of a photo tile. */
  variant?: 'report';
  reportLabel?: string;
  reportKicker?: string;
};

export const solutions = {
  eyebrow: 'Solutions',
  heading: 'What Can We Help You With?',
  intro:
    'From a first conversation to handover, furnishing and management — every part of owning property in Dubai, handled under one roof.',
  tiles: [
    {
      id: 'specialist',
      title: 'Connect With a Specialist',
      subtitle: 'Speak directly with a D|R|P advisor',
      href: '#contact',
      image: '/images/office-night.webp',
      alt: 'The D|R|P office on Golden Mile, Palm Jumeirah, lit up at night',
      imagePosition: '50% 22%',
      span: 'large',
    },
    {
      id: 'list',
      title: 'List Your Property',
      subtitle: 'Sell or lease with D|R|P',
      href: '/list-your-property',
      image: '/images/listyourproperty.webp',
      alt: 'A contemporary villa with a lit pool at twilight',
      span: 'large',
    },
    {
      id: 'ready',
      title: 'Find a Ready Property',
      subtitle: 'Explore properties available now for sale or rent',
      href: '/properties',
      image: '/images/property1.jpeg',
      alt: 'A bright, furnished living room in a ready Dubai apartment',
      span: 'standard',
    },
    {
      id: 'offplan',
      title: 'Explore Off-Plan Collections',
      subtitle: 'Discover selected new developments',
      href: '/off-plan',
      image: unsplash('1504307651254-35680f356dfd'),
      alt: 'Construction crews at work on a new development',
      span: 'standard',
    },
    {
      id: 'report',
      title: 'Read the D|R|P Magazine',
      subtitle: 'Dubai property stories and market insight',
      href: '/magazine',
      span: 'tall',
      variant: 'report',
      reportKicker: 'D|R|P',
      reportLabel: 'Coming soon',
    },
    {
      id: 'areas',
      title: 'Explore Dubai Areas',
      subtitle: 'Discover communities across Dubai',
      href: '/areas',
      image: unsplash('1526495124232-a04e1849168c'),
      alt: 'The Downtown Dubai skyline at dusk',
      span: 'standard',
    },
    {
      id: 'holiday',
      title: 'Holiday Homes',
      subtitle: 'Stay with D|R|P or list your property',
      href: HOLIDAY_HOMES_URL,
      external: true,
      image: '/images/living1.jpeg',
      alt: 'A sunlit holiday home terrace with sea views',
      span: 'standard',
    },
    {
      id: 'furnishings',
      title: 'Furnishings',
      subtitle: 'Furnish and prepare your property',
      href: '/drp-furnishing#packages',
      image: '/images/furnishings.jpg',
      alt: 'A styled living room with designer furniture',
      span: 'standard',
    },
    {
      id: 'fleet',
      title: 'D|R|P Car Fleet',
      subtitle: 'Explore our vehicle services',
      href: '/ecosystem/car-fleet',
      image: '/images/car.jpeg',
      alt: 'A luxury car parked outside a modern residence',
      span: 'standard',
    },
    {
      id: 'ecosystem',
      title: 'D|R|P Ecosystem',
      subtitle: 'Discover all D|R|P services and solutions',
      href: '/ecosystem',
      image: '/images/palm3.png',
      alt: 'The Dubai skyline seen across the city',
      span: 'wide',
    },
  ] satisfies SolutionTile[],
};

/* -------------------------------------------------------------------------- */
/*  SECTION 02 — EXPLORE PROPERTIES                                           */
/* -------------------------------------------------------------------------- */

export type ReadyProperty = {
  id: string;
  title: string;
  price: string;
  type: string;
  location: string;
  beds: string;
  baths?: string;
  area: string;
  /** Floor area, so the card can show it in the visitor's unit */
  sqft?: number;
  status?: string;
  /** Hot deal: the badge turns orange */
  hot?: boolean;
  /** The price in AED, so the card can show it in the visitor's currency */
  aed?: number;
  /** href is a page outside this Next app, e.g. a deal's landing page */
  document?: boolean;
  image: string;
  alt: string;
  href: string;
};

/** Homepage "Ready to Buy" tab — from /data/properties.ts. */
export const readyProperties: ReadyProperty[] = homepageSale.map(
  (l) => toPropertyCard(l).item as ReadyProperty,
);

export type RentalProperty = {
  id: string;
  title: string;
  /** Rendered in serif; `period` follows in smaller grey sans. */
  price: string;
  period: string;
  type: string;
  location: string;
  beds: string;
  baths: string;
  area: string;
  /** Floor area, so the card can show it in the visitor's unit */
  sqft?: number;
  status: string;
  /** Hot deal: the badge turns orange */
  hot?: boolean;
  /** The price in AED, so the card can show it in the visitor's currency */
  aed?: number;
  /** href is a page outside this Next app, e.g. a deal's landing page */
  document?: boolean;
  image: string;
  alt: string;
  href: string;
};

/** Homepage "For Rent" tab — from /data/properties.ts. */
export const rentalProperties: RentalProperty[] = homepageRent.map(
  (l) => toPropertyCard(l).item as RentalProperty,
);

export type OffPlanProject = {
  id: string;
  title: string;
  developer: string | null;
  community: string;
  fromPrice: string;
  handover: string;
  paymentPlan: string | null;
  /** Shown in place of the payment plan when none is published */
  units: string;
  image: string;
  alt: string;
  href: string;
};

/** The homepage's off-plan tab shows four projects from /data/offPlan.ts. */
export const offPlanProjects: OffPlanProject[] = featuredProjects.map((p) => ({
  id: p.slug,
  title: p.name,
  developer: p.developer,
  community: p.area,
  fromPrice: p.fromPrice == null ? priceLabel(p) : `From ${priceLabel(p)}`,
  handover: handoverLabel(p),
  paymentPlan: p.paymentPlan,
  units: unitTypesLabel(p),
  image: p.image,
  alt: p.alt,
  href: projectHref(p.slug),
}));

export const exploreProperties = {
  eyebrow: 'Explore Real Estate',
  heading: 'Selected Properties',
  /** Tab ids match the shared `Offering` union so both search bars agree. */
  tabs: [
    {
      id: 'buy',
      label: 'Ready to Buy',
      viewAll: { label: 'View All Properties', href: '/properties?offering=buy' },
    },
    {
      id: 'rent',
      label: 'For Rent',
      viewAll: { label: 'View All Properties', href: '/properties?offering=rent' },
    },
    {
      id: 'offplan',
      label: 'Off-Plan',
      viewAll: { label: 'Explore Off-Plan Projects', href: '/off-plan' },
    },
  ] satisfies {
    id: Offering;
    label: string;
    viewAll: { label: string; href: string };
  }[],
};

/* -------------------------------------------------------------------------- */
/*  SECTION 04 — NEWS & INSIGHTS                                              */
/* -------------------------------------------------------------------------- */

export type Article = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  alt: string;
  href: string;
};

/** Articles live in /data/news.ts (DEMO PLACEHOLDERS until the magazine feed is connected). */
export const news = {
  eyebrow: 'News & Insights',
  heading: 'Stay Ahead Of The Market.',
  viewAll: {
    label: 'View All News',
    href: '/news',
  },
  /** From /data/news.ts, newest first. */
  articles: articles.map((a) => ({
    id: a.slug,
    category: a.category,
    title: a.title,
    excerpt: a.excerpt,
    date: formatArticleDate(a.date),
    image: a.image,
    alt: a.alt,
    href: articleHref(a.slug),
  })) satisfies Article[],
};

/* -------------------------------------------------------------------------- */
/*  SECTION 05 — WHY CLIENTS TRUST DRP                                        */
/* -------------------------------------------------------------------------- */

export type TrustStat = {
  id: string;
  label: string;
  support: string;
  /** Renders as an animated count-up when present. */
  value?: number;
  countFrom?: number;
  /** Used instead of `value` for the wordmark-style facts. */
  title?: string;
};

export const trustStats: TrustStat[] = [
  {
    id: 'established',
    value: 2007,
    countFrom: 1990,
    label: 'Established',
    support: 'Nearly two decades advising buyers, sellers and investors in Dubai.',
  },
  {
    id: 'global',
    title: 'Dubai-Based, Internationally Connected',
    label: 'Global reach',
    support: 'Headquartered on Palm Jumeirah, working with clients across 40+ countries.',
  },
  {
    id: 'ecosystem',
    title: 'Full Property Ecosystem',
    label: 'One team',
    support: 'Sales, leasing, holiday homes, furnishing and management under one roof.',
  },
];

export const trust = {
  eyebrow: 'Why Our Clients Trust Us',
  stats: trustStats,
  /** DEMO PLACEHOLDER — confirm the live Google rating before launch. */
  ratingLine: 'Rated 4.9 on Google',
};

export type Review = {
  id: string;
  quote: string;
  name: string;
  source: string;
  stars: number;
};

// DEMO PLACEHOLDERS – replace with real Google reviews before launch
export const reviews: Review[] = [
  {
    id: 'r1',
    quote:
      'They understood exactly what we were looking for on the Palm and never wasted our time with the wrong properties.',
    name: 'Alexander M.',
    source: 'Google Review',
    stars: 5,
  },
  {
    id: 'r2',
    quote:
      'We bought off-plan from London and the team handled every step remotely. Completely straightforward.',
    name: 'Priya S.',
    source: 'Google Review',
    stars: 5,
  },
  {
    id: 'r3',
    quote:
      'Honest advice on what our villa was really worth, and it sold within six weeks of listing.',
    name: 'Daniel K.',
    source: 'Google Review',
    stars: 5,
  },
  {
    id: 'r4',
    quote:
      'They furnished and let our apartment while we were abroad. The reporting has been faultless.',
    name: 'Sofia R.',
    source: 'Google Review',
    stars: 5,
  },
  {
    id: 'r5',
    quote:
      'A genuinely knowledgeable team. Their read on the market saved us from a poor investment.',
    name: 'Omar A.',
    source: 'Google Review',
    stars: 5,
  },
  {
    id: 'r6',
    quote:
      'Professional from the first call to handover. We have since bought a second property through them.',
    name: 'Claire D.',
    source: 'Google Review',
    stars: 5,
  },
];

/* -------------------------------------------------------------------------- */
/*  SECTION 06 — CONTACT                                                      */
/* -------------------------------------------------------------------------- */

export const contactSection = {
  eyebrow: 'Get In Touch',
  heading: 'Speak With a Real Estate Specialist Today',
  paragraph:
    "Whether you're looking to buy, invest, sell or manage a property, our team is ready to assist.",
  // REAL – DRP's own photo of the office reception
  image: '/images/contact-office.webp',
  imageAlt: 'The D|R|P reception on Palm Jumeirah, with the D|R|P sign and brochure',
  interests: [
    'Buying',
    'Off-Plan Investment',
    'Selling',
    'Renting',
    'Property Management',
    'Holiday Homes',
    'Furnishings',
    'Other',
  ],
  submitLabel: 'Connect With D|R|P',
  successTitle: 'Thank you — your enquiry is with us.',
  successBody:
    'A D|R|P specialist will be in touch shortly. For anything urgent, call or WhatsApp us directly.',
};

/* -------------------------------------------------------------------------- */
/*  FOOTER                                                                    */
/* -------------------------------------------------------------------------- */

export const footer = {
  tagline:
    'A Palm Jumeirah real estate agency since 2007 — property, investment and management across Dubai.',
  columns: [
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Meet the Team', href: '/about#team' },
        { label: 'Careers', href: '/careers' },
        { label: 'D|R|P Ecosystem', href: '/ecosystem' },
        { label: 'News & Blogs', href: '/news' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      heading: 'Real Estate',
      links: [
        { label: 'Properties', href: '/properties' },
        { label: 'Off-Plan', href: '/off-plan' },
        { label: 'Explore Dubai Areas', href: '/areas' },
        { label: 'List Your Property', href: '/list-your-property' },
        { label: "Buyer's Guide", href: '/buying-guide' },
        { label: 'Golden Visa', href: '/golden-visa' },
        { label: 'Property Calculators', href: '/calculators' },
      ],
    },
    {
      heading: 'Services',
      links: [
        { label: 'Holiday Homes', href: HOLIDAY_HOMES_URL },
        { label: 'Fit Out', href: '/fit-out' },
        { label: 'D|R|P Furnishing', href: '/drp-furnishing' },
        { label: 'Car Fleet', href: '/ecosystem/car-fleet' },
        { label: 'Owner Portal', href: '/owner-portal' },
      ],
    },
  ] satisfies { heading: string; links: NavItem[] }[],
  /** REAL – DRP's official social accounts */
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/drp_dubairapidproperties' },
    { label: 'Facebook', href: 'https://www.facebook.com/dubairapidproperties/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/dubairapidproperties' },
    { label: 'X', href: 'https://x.com/drp_realestate' },
  ],
  /** Subtle closing line above the legal bar. */
  careersNote: {
    text: 'Interested in joining D|R|P?',
    linkLabel: 'View open positions',
    href: '/careers',
  },
  legal: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
  copyright: '© 2026 Dubai Rapid Properties. All rights reserved.',
};