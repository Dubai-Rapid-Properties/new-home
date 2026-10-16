/**
 * ============================================================================
 *  NEWS & INSIGHTS — /news, /magazine/[slug] and the homepage carousel
 * ============================================================================
 *  DEMO PLACEHOLDERS — replace with real posts from the DRP Magazine feed.
 *  Titles, dates and article text are illustrative but written in DRP's voice;
 *  figures in the text are deliberately general. They are kept here for the
 *  layout only: `articles` (what the site shows) is empty until real posts
 *  arrive, and /magazine/* redirects to /news meanwhile (next.config.mjs).
 * ============================================================================
 */

import { unsplash } from '@/lib/media';
import { toSlug } from '@/lib/slug';

export type ArticleSection = { heading?: string; paragraphs: string[] };

export type NewsArticle = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  /** ISO date */
  date: string;
  author: string;
  readMinutes: number;
  image: string;
  alt: string;
  body: ArticleSection[];
};

export const demoArticles: NewsArticle[] = [
  {
    slug: 'dubai-residential-market-h1-2026',
    category: 'Market Reports',
    title: 'Dubai Residential Market: What H1 2026 Tells Us',
    excerpt:
      'Transaction volumes, prime price movement and where the next wave of demand is forming across the city.',
    date: '2026-09-12',
    author: 'D|R|P Research',
    readMinutes: 6,
    image: unsplash('1512453979798-5ea266f8880c', 2000),
    alt: 'An aerial view of the Dubai skyline at dusk',
    body: [
      {
        paragraphs: [
          'The first half of 2026 confirmed what many of our clients had felt on the ground: demand for Dubai residential property has broadened rather than cooled. Activity spread from the established prime addresses into newer master-planned communities, and off-plan continued to account for a large share of sales.',
        ],
      },
      {
        heading: 'Prime holds its ground',
        paragraphs: [
          'Palm Jumeirah, Downtown Dubai and Dubai Hills Estate remained the reference points for prime pricing. Supply of finished beachfront villas stayed tight, and well-presented homes continued to sell quickly when priced in line with recent comparables.',
          'Where sellers over-reached, days on market lengthened. Buyers at the top end are well informed and increasingly compare against recent transactions rather than asking prices.',
        ],
      },
      {
        heading: 'Off-plan and payment plans',
        paragraphs: [
          'New launches from the major developers drew strong first-day interest, particularly where payment plans weighted more of the price towards handover. Investors are paying close attention to developer track record and construction progress, not just price.',
        ],
      },
      {
        heading: 'What we are watching',
        paragraphs: [
          'Delivery volumes over the next two years, rental growth in mid-market communities and the pace of new island launches will shape the second half of the year. Our full H1 report breaks these down area by area.',
        ],
      },
    ],
  },
  {
    slug: 'palm-jumeirah-prime-benchmark',
    category: 'Dubai Property News',
    title: 'Why Palm Jumeirah Still Sets the Benchmark for Prime',
    excerpt:
      'Limited supply, beachfront scarcity and a maturing resale market continue to underpin values on the island.',
    date: '2026-08-28',
    author: 'D|R|P Sales Team',
    readMinutes: 5,
    image: '/images/palm.jpg',
    alt: 'The Jumeirah beachfront and Burj Al Arab',
    body: [
      {
        paragraphs: [
          'Nearly two decades after the first residents moved in, Palm Jumeirah is still the address international buyers ask about first. From our office on the Golden Mile we see why every day.',
        ],
      },
      {
        heading: 'Scarcity that cannot be replicated',
        paragraphs: [
          'There is a fixed number of frond villas with private beach frontage, and very few come to market in any given year. New islands will add beachfront supply, but not on Palm Jumeirah itself, and not with its established infrastructure.',
        ],
      },
      {
        heading: 'A market with depth',
        paragraphs: [
          'The island now has a long transaction history across villas, apartments and branded residences. That depth makes pricing more transparent and resale more predictable, which matters to buyers committing significant capital.',
        ],
      },
      {
        heading: 'What it means for owners',
        paragraphs: [
          'For sellers, presentation and accurate pricing are decisive. For landlords, furnished homes on the island continue to perform strongly as both long lets and holiday homes.',
        ],
      },
    ],
  },
  {
    slug: 'off-plan-or-ready-2026',
    category: 'Investment Insights',
    title: 'Off-Plan or Ready? Structuring a Dubai Portfolio in 2026',
    excerpt:
      'Payment plans, yield timing and exit liquidity — how experienced investors are balancing the two.',
    date: '2026-08-15',
    author: 'D|R|P Investment Advisory',
    readMinutes: 7,
    image: unsplash('1454165804606-c3d57bc86b40', 2000),
    alt: 'Investors reviewing documents around a meeting table',
    body: [
      {
        paragraphs: [
          'It is one of the first questions new investors ask us: should I buy off-plan or ready? The honest answer is that most experienced investors hold both, for different reasons.',
        ],
      },
      {
        heading: 'Ready property: income from day one',
        paragraphs: [
          'A ready home can be let immediately, so rental income starts on transfer. You can see exactly what you are buying, and mortgage finance is simpler to arrange.',
        ],
      },
      {
        heading: 'Off-plan: staged payments and launch pricing',
        paragraphs: [
          'Off-plan spreads the cost over the construction period and often gives access to launch prices. The trade-off is time: there is no income until handover, and your capital is tied to the developer’s delivery.',
        ],
      },
      {
        heading: 'Balancing the two',
        paragraphs: [
          'A common structure is a ready apartment for income alongside one or two off-plan units for growth, with handovers staggered so cash flow stays manageable. We model these scenarios for clients before they commit.',
        ],
      },
    ],
  },
  {
    slug: 'launches-worth-watching',
    category: 'New Launches',
    title: 'Five Launches Worth Watching This Quarter',
    excerpt:
      'A shortlist of new releases from Emaar, Nakheel and Sobha, and what makes each one worth a second look.',
    date: '2026-08-02',
    author: 'D|R|P Off-Plan Team',
    readMinutes: 4,
    image: '/images/como.jpg',
    alt: 'A newly launched residential tower in Dubai',
    body: [
      {
        paragraphs: [
          'Not every launch deserves your attention. Our off-plan team reviews each new release for location, developer track record, payment plan and pricing against nearby completed stock. These five stood out this quarter.',
        ],
      },
      {
        heading: 'Waterfront first',
        paragraphs: [
          'Two of our picks sit on new island communities, where beachfront launch pricing is still well below established equivalents. Expect longer handover timelines in exchange.',
        ],
      },
      {
        heading: 'Established communities',
        paragraphs: [
          'The remaining three are in proven areas with strong resale and rental histories: lower risk, with less upside from area growth. All five are listed in our Latest Launches section with current availability.',
        ],
      },
    ],
  },
  {
    slug: 'property-and-the-golden-visa',
    category: 'Investment Insights',
    title: 'Property and the Golden Visa: A Practical Guide',
    excerpt:
      'Thresholds, eligibility and the paperwork sequence — what property buyers actually need to prepare.',
    date: '2026-07-19',
    author: 'D|R|P Client Services',
    readMinutes: 6,
    image: '/images/golden.jpg',
    alt: 'Two people shaking hands after completing a property transaction',
    body: [
      {
        paragraphs: [
          'The UAE Golden Visa offers long-term residency to property investors who meet a minimum investment value. For many of our international clients it is a key part of the decision to buy in Dubai.',
        ],
      },
      {
        heading: 'The investment threshold',
        paragraphs: [
          'The property route has been based on a minimum total property value set by the authorities, which can be met with one property or several. Rules on mortgaged and off-plan property have changed over time, so always confirm the current requirements before you buy.',
        ],
      },
      {
        heading: 'The paperwork sequence',
        paragraphs: [
          'Typically you will need the title deed, a valuation or property certificate, passport copies and a medical test, submitted through the relevant immigration authority. Our client services team prepares the documents alongside your purchase.',
        ],
      },
      {
        heading: 'Plan it with your purchase',
        paragraphs: [
          'If residency matters to you, tell us at the start. It can affect which property, how many, and how you finance them.',
        ],
      },
    ],
  },
  {
    slug: 'drp-arabian-business-feature',
    category: 'Arabian Business',
    title: 'D|R|P in Arabian Business: Two Decades on the Island',
    excerpt: 'Our founders on building a Palm Jumeirah agency through three market cycles since 2007.',
    date: '2026-07-04',
    author: 'D|R|P',
    readMinutes: 4,
    image: unsplash('1556761175-5973dc0f32e7', 2000),
    alt: 'A business interview taking place in a Dubai office',
    body: [
      {
        paragraphs: [
          'Arabian Business sat down with D|R|P’s founders to talk about opening an agency on Palm Jumeirah in 2007, and what it has taken to grow through three distinct market cycles.',
        ],
      },
      {
        heading: 'Built on the island',
        paragraphs: [
          'From the beginning D|R|P focused on knowing a small number of communities in great depth. That local knowledge became the foundation for every service the company has added since.',
        ],
      },
      {
        heading: 'From agency to ecosystem',
        paragraphs: [
          'Today D|R|P covers sales, leasing, off-plan, holiday homes, furnishing, interiors and property management, so owners can work with one team from purchase to income.',
        ],
      },
    ],
  },
  {
    slug: 'holiday-home-yields-2026',
    category: 'Market Reports',
    title: 'Holiday Home Yields: Reading the 2026 Season',
    excerpt: 'Occupancy, average daily rates and which communities outperformed over the winter season.',
    date: '2026-06-21',
    author: 'D|R|P Holiday Homes',
    readMinutes: 5,
    image: '/images/homs.webp',
    alt: 'The living room of a furnished Dubai holiday home',
    body: [
      {
        paragraphs: [
          'The winter season is where holiday-home returns are made. Across the homes we manage, the strongest performers shared three traits: location, presentation and pricing that moved with demand.',
        ],
      },
      {
        heading: 'Location still leads',
        paragraphs: [
          'Beachfront and landmark-view homes in Palm Jumeirah, JBR, Dubai Marina and Downtown Dubai led on both occupancy and nightly rates.',
        ],
      },
      {
        heading: 'Presentation pays',
        paragraphs: [
          'Professionally furnished and photographed homes consistently outperformed similar units with dated interiors. It is the single change owners most often underestimate.',
        ],
      },
      {
        heading: 'Dynamic pricing',
        paragraphs: [
          'Rates adjusted daily for events, seasonality and booking pace beat fixed seasonal pricing by a clear margin. This is now standard across the D|R|P portfolio.',
        ],
      },
    ],
  },
];

/** The articles the site shows. Empty until the real magazine feed replaces the demo ones. */
export const articles: NewsArticle[] = [];

export const articleHref = (slug: string) => `/magazine/${slug}`;
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const formatArticleDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

/** Category filter tabs on /news; ids match the ?category= links in the nav. */
export const categories = [...new Set(articles.map((a) => a.category))].map((label) => ({
  id: toSlug(label),
  label,
}));

export function relatedArticles(a: NewsArticle, count = 3) {
  return articles
    .filter((x) => x.slug !== a.slug)
    .sort((x, y) => Number(y.category === a.category) - Number(x.category === a.category))
    .slice(0, count);
}
