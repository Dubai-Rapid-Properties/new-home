/**
 * ============================================================================
 *  DEVELOPER NETWORK — /off-plan/developers
 * ============================================================================
 *  Every developer behind an off-plan project on the site: D|R|P's own
 *  projects and the rest of Dubai's (data/offPlan.ts). Logos were taken from each developer's own
 *  website and live in /public/developers/; they render in one colour on the
 *  page, so any version of the logo (white, black, colour) works.
 *
 *  A developer without `logo` shows its name instead. To add one later, drop
 *  the file into /public/developers/ and set `logo` below.
 * ============================================================================
 */

import { toSlug } from '@/lib/slug';
import { projects } from './offPlan';

type DeveloperInfo = {
  /** Must match the developer name on the projects */
  name: string;
  logo?: string;
  /** Enlarges a logo whose file carries extra padding or a square mark */
  logoScale?: number;
  website?: string;
};

const info: DeveloperInfo[] = [
  { name: 'Emaar', logo: '/developers/emaar.svg', website: 'https://www.emaar.com' },
  { name: 'DAMAC', logo: '/developers/damac.svg', website: 'https://www.damacproperties.com' },
  { name: 'Binghatti', logo: '/developers/binghatti.svg', website: 'https://www.binghatti.com' },
  { name: 'Danube', logo: '/developers/danube.png', website: 'https://danubeproperties.com' },
  { name: 'OMNIYAT', logo: '/developers/omniyat.svg', website: 'https://omniyat.com' },
  { name: 'Sobha Realty', logo: '/developers/sobha.svg', website: 'https://sobharealty.com' },
  { name: 'Ellington', logo: '/developers/ellington.png', website: 'https://ellingtonproperties.ae' },
  { name: 'Aldar', logo: '/developers/aldar.png', logoScale: 1.25, website: 'https://www.aldar.com' },
  { name: 'Samana', logo: '/developers/samana.png', website: 'https://www.samanadevelopers.com' },
  { name: 'Reportage', logo: '/developers/reportage.png', website: 'https://reportagegroup.com' },
  { name: 'Imtiaz', logo: '/developers/imtiaz.svg', website: 'https://imtiaz.ae' },
  { name: 'H&H', logo: '/developers/h-and-h.svg', website: 'https://www.h-h.ae' },
  { name: 'Peace Homes', logo: '/developers/peace-homes.png', website: 'https://www.peacehomesdevelopment.com' },
  { name: 'Pantheon', logo: '/developers/pantheon.png', website: 'https://pantheondevelopment.ae' },
  { name: 'SOL Properties', logo: '/developers/sol.png', website: 'https://solproperties.ae' },
  { name: 'AHS Properties', logo: '/developers/ahs.png', website: 'https://ahsproperties.com' },
  { name: 'Acube Developments', logo: '/developers/acube.svg', website: 'https://acubedevelopments.com' },
  { name: 'Mr. Eight Development', logo: '/developers/mr-eight.png', website: 'https://mr8.ae' },
  { name: 'AMIS Development', logo: '/developers/amis.png', website: 'https://www.amisdevelopment.com' },
  { name: 'Swank Development', logo: '/developers/swank.png', website: 'https://swankdevelopment.com' },
  { name: 'Chaimaa Holding', logo: '/developers/chaimaa.svg', website: 'https://chaimaaholding.com' },
  /* No logo yet: their sites block automated access, or none was found */
  { name: 'Meraas', website: 'https://www.meraas.com' },
  { name: 'Azizi', website: 'https://azizidevelopments.com' },
  { name: 'Wasl', website: 'https://www.wasl.ae' },
  { name: 'Dar Global', website: 'https://www.darglobal.co.uk' },
  { name: 'Zoya' },
  { name: 'Valores' },
  { name: 'Evera Development' },
];

export type Developer = DeveloperInfo & {
  /** Number of DRP off-plan projects by this developer */
  projects: number;
  /** /off-plan/projects filtered to this developer */
  href: string;
};

/**
 * Every developer with projects on the site, most projects first. A developer
 * that appears in a new import but not in `info` still shows, by name.
 */
export const developers: Developer[] = [...new Set(projects.flatMap((p) => (p.developer ? [p.developer] : [])))]
  .map((name) => ({
    ...(info.find((d) => d.name === name) ?? { name }),
    projects: projects.filter((p) => p.developer === name).length,
    href: `/off-plan/projects?developer=${toSlug(name)}#projects`,
  }))
  .sort((a, b) => b.projects - a.projects || a.name.localeCompare(b.name));

/* Shown as logo cards: developers with a logo, or a large portfolio */
const FEATURED_FROM = 10;
export const featuredDevelopers = developers.filter((d) => d.logo || d.projects >= FEATURED_FROM);
/** Every other developer, A to Z, listed by name under the cards */
export const otherDevelopers = developers
  .filter((d) => !featuredDevelopers.includes(d))
  .sort((a, b) => a.name.localeCompare(b.name));

export const developerNetwork = {
  hero: {
    eyebrow: 'Off-Plan',
    heading: 'Developer Network',
    intro: "Every developer with an off-plan project in Dubai, from the master developers to boutique names.",
    image: '/images/newproperty.webp',
    imageAlt: 'A new residential development in Dubai',
  },
};
