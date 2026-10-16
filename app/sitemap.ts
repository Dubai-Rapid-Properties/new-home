import type { MetadataRoute } from 'next';
import { areas } from '@/data/areas';
import { team, teamHref } from '@/data/company';
import { collectionHref, offPlanCollections, projectHref, projects } from '@/data/offPlan';
import { listingHref, listings } from '@/data/properties';
import { siteUrl } from '@/lib/siteUrl';

/* Every public page. The demo news articles stay out until the real magazine feed replaces them. */
const pages = [
  '/',
  '/properties',
  '/properties/jebel-ali-villa',
  '/off-plan',
  '/off-plan/projects',
  '/off-plan/collections',
  '/off-plan/latest-launches',
  '/off-plan/developers',
  '/off-plan/construction-tracker',
  '/areas',
  '/buying-guide',
  '/selling-guide',
  '/golden-visa',
  '/calculators',
  '/property-management',
  '/property-valuation',
  '/list-your-property',
  '/holiday-homes',
  '/holiday-homes/list-your-property',
  '/drp-furnishing',
  '/fit-out',
  '/ecosystem',
  '/ecosystem/mortgage',
  '/ecosystem/company-formation',
  '/ecosystem/car-fleet',
  '/ecosystem/partner-network',
  '/market-report',
  '/news',
  '/about',
  '/careers',
  '/contact',
  '/owner-portal',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, lastModified: Date | string = now): MetadataRoute.Sitemap[number] => ({
    url: `${siteUrl}${path}`,
    lastModified,
  });
  return [
    ...pages.map((p) => entry(p)),
    ...listings.map((l) => entry(listingHref(l.slug), l.listedAt || now)),
    ...projects.map((p) => entry(projectHref(p.slug))),
    ...offPlanCollections.map((c) => entry(collectionHref(c.slug))),
    ...areas.map((a) => entry(`/areas/${a.slug}`)),
    ...team.map((m) => entry(teamHref(m))),
  ];
}
