/**
 * Redirects from the old WordPress site's addresses to the new pages, so
 * links in Google, portals and old emails keep working after the domain
 * moves. Read by next.config.mjs at build time; dynamic pages (listings,
 * projects, team) are matched against the current data, everything else
 * falls back to the closest section.
 */
import { readFileSync } from 'node:fs';

const json = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));
const slugify = (s) =>
  s.trim().toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/* The Holiday Homes website, where the homes are listed and booked (data/external.ts) */
const STAY = 'https://stay.dubairapidproperties.com';

/* Old project-location slugs → the new area guides (the rest open the project search) */
const AREAS = {
  'palm-jumeirah': 'palm-jumeirah',
  'dubai-marina': 'dubai-marina',
  'downtown-dubai': 'downtown-dubai',
  'burj-khalifa-downtown': 'downtown-dubai',
  'business-bay': 'business-bay',
  'dubai-hills': 'dubai-hills-estate',
  'dubai-hills-estate': 'dubai-hills-estate',
  'jumeirah-beach-residence-jbr': 'jumeirah-beach-residence',
  'arabian-ranches-3': 'arabian-ranches',
  'dubai-islands': 'dubai-islands',
  'palm-jebel-ali': 'palm-jebel-ali',
  'dubai-creek-harbour': 'dubai-creek-harbour',
  'jvc-jumeirah-village-circle': 'jvc',
  'mohammed-bin-rashid-city': 'mohammed-bin-rashid-city',
};

/* Old off-plan collection slugs → the new collections */
const COLLECTIONS = {
  'latest-launch': '/off-plan/latest-launches',
  'investment-collection': '/off-plan/collections',
  'construction-updates': '/off-plan/construction-tracker',
  'luxury-collection': '/off-plan/collections/luxury',
  'best-affordable-townhouse-villa-projects': '/off-plan/collections/townhouses-villas',
  'best-roi-capital-growth-projects': '/off-plan/collections/roi-growth',
  'best-projects-under-aed-1-5m': '/off-plan/collections/under-aed-1-5m',
};

const PRICE_RANGES = {
  'aed-1m-2m': '/off-plan/projects?min=1000000&max=2000000',
  'aed-2m-5m': '/off-plan/projects?min=2000000&max=5000000',
  'aed-5m': '/off-plan/projects?min=5000000',
};

/* One-off WordPress pages */
const PAGES = {
  '/about-us': '/about',
  '/contact-us': '/contact',
  '/terms-condition': '/terms',
  '/privacy-policy': '/privacy',
  '/construction-updates': '/off-plan/construction-tracker',
  '/projects-drp': '/off-plan/projects',
  '/drp-project-details': '/off-plan/projects',
  '/drp-marina-vista': '/off-plan/projects',
  '/latest-launches': '/off-plan/latest-launches',
  '/investment-collections': '/off-plan/collections',
  '/best-projects-under-aed-1-5m': '/off-plan/collections/under-aed-1-5m',
  '/best-growth-roi-projects': '/off-plan/collections/roi-growth',
  '/best-affordable-townhouse-villa-projects': '/off-plan/collections/townhouses-villas',
  '/luxury-collection': '/off-plan/collections/luxury',
  '/owner-dashboard': '/owner-portal',
  '/owner-login': '/owner-portal',
  '/my-account-2': '/owner-portal',
  '/holiday-home': '/holiday-homes',
  '/pre-summer-offer': '/holiday-homes',
  '/shop': '/holiday-homes',
  '/accommodations': STAY,
  '/search-results': STAY,
  '/search-availability': STAY,
  '/booking-cancellation': STAY,
  '/drp-magazine': '/news',
  '/news-blogs': '/news',
  '/test-form-to-bitrix': '/',
  '/interior-design-detail/signature-package': '/drp-furnishing#packages',
  '/interior-design-detail/essentials-package': '/drp-furnishing#packages',
};

/* Whole sections, after the exact matches above */
const SECTIONS = {
  '/projects': '/off-plan/projects',
  '/drp_project_details': '/off-plan/projects',
  '/project_location': '/off-plan/projects',
  '/project_collection': '/off-plan/collections',
  '/price_range': '/off-plan/projects',
  '/handover': '/off-plan/projects',
  '/amenities-detail': '/off-plan',
  '/drp-project-tool-detail': '/off-plan/construction-tracker',
  '/property-detail': '/properties',
  '/agents-detail': '/about#team',
  '/teams-detail': '/about#team',
  '/interior-design-detail': '/drp-furnishing',
  '/accommodation': STAY,
  '/accommodation-category': STAY,
  '/accommodation-facility': STAY,
  '/booking-confirmation': STAY,
  '/mphb_template': '/holiday-homes',
  '/product': '/holiday-homes',
  '/product-category': '/holiday-homes',
  '/product-tag': '/holiday-homes',
  '/register': '/owner-portal',
  '/category': '/news',
};

export function legacyRedirects() {
  const legacy = json('legacy/wordpress-urls.json');
  const projects = new Set(json('imported/projects.json').map((p) => p.slug));
  /* The listings the site has a page for: the same filter as data/properties.ts (hidden in the portal, commercial or without a size are left out) */
  const hidden = new Set(json('imported/hidden-listings.json'));
  const listings = new Set(
    [...json('imported/listings.json'), ...json('imported/portal-listings.json')]
      .filter((l) => !hidden.has(l.slug) && l.type !== 'Commercial' && l.size)
      .map((l) => l.slug),
  );
  const team = json('imported/team.json');
  const teamSlugs = new Set(team.map((t) => slugify(t.name)));

  const exact = { ...PAGES };
  for (const p of legacy.posts) exact[`/${p}`] = '/news';

  for (const s of legacy.projects) if (projects.has(s)) exact[`/projects/${s}`] = `/off-plan/${s}`;
  for (const s of legacy.projectDetails) {
    const base = s.replace(/-\d+$/, '');
    if (projects.has(base)) exact[`/drp_project_details/${s}`] = `/off-plan/${base}`;
  }
  for (const s of legacy.propertyDetail) if (listings.has(s)) exact[`/property-detail/${s}`] = `/properties/${s}`;
  /* Old listing pages share /properties/[slug]; only those no longer listed need sending on */
  for (const s of legacy.properties) if (!listings.has(s)) exact[`/properties/${s}`] = '/properties';

  for (const s of legacy.locations) {
    exact[`/project_location/${s}`] = AREAS[s] ? `/areas/${AREAS[s]}` : `/off-plan/projects?q=${s}`;
  }
  for (const [s, to] of Object.entries(COLLECTIONS)) exact[`/project_collection/${s}`] = to;
  for (const [s, to] of Object.entries(PRICE_RANGES)) exact[`/price_range/${s}`] = to;
  for (const year of ['2026', '2027', '2028']) exact[`/handover/${year}`] = `/off-plan/projects?handover=${year}`;
  for (const year of ['2029', '2030', '2031']) exact[`/handover/${year}`] = '/off-plan/projects?handover=2029-plus';

  for (const t of team) {
    exact[`/teams-detail/${t.slug}`] = `/about/team/${slugify(t.name)}`;
  }
  /* Agent profiles were keyed by name */
  for (const s of teamSlugs) exact[`/agents-detail/${s}`] = `/about/team/${s}`;

  return [
    ...Object.entries(exact).map(([source, destination]) => ({ source, destination, permanent: true })),
    ...Object.entries(SECTIONS).flatMap(([section, destination]) => [
      { source: section, destination, permanent: true },
      { source: `${section}/:path*`, destination, permanent: true },
    ]),
  ];
}
