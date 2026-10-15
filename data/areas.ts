/**
 * ============================================================================
 *  DUBAI AREA GUIDES — /areas and /areas/[slug]
 * ============================================================================
 *  Every area a listing or off-plan project points at has a guide here; the
 *  guide page pulls those listings and projects in by matching `name`.
 *
 *  DEMO PLACEHOLDERS – price per sq ft, yields and drive times are indicative
 *  figures for the demo. Replace with DRP research before launch.
 * ============================================================================
 */

import { unsplash } from '@/lib/media';
import { toSlug } from '@/lib/slug';

export type Area = {
  slug: string;
  name: string;
  tagline: string;
  intro: string[];
  image: string;
  alt: string;
  facts: { pricePerSqft: string; rentalYield: string; airport: string; homes: string };
  highlights: { title: string; text: string }[];
};

const area = (a: Omit<Area, 'slug'>): Area => ({ ...a, slug: toSlug(a.name) });

/** The guide's indicative price per sq ft as a number, e.g. 3900 */
export const factPsf = (a: { facts: { pricePerSqft: string } }) => Number(a.facts.pricePerSqft.replace(/[^\d]/g, ''));

export const areas: Area[] = [
  area({
    name: 'Palm Jumeirah',
    tagline: 'Dubai’s island address, and D|R|P’s home since 2007.',
    intro: [
      'Palm Jumeirah remains the benchmark for prime residential property in Dubai. Beachfront villas on the fronds, branded residences on the crescent and apartments along the trunk give the island a depth few communities can match.',
      'D|R|P is based on the Golden Mile, so our team knows the island building by building — from frond orientation and plot sizes to which towers lead resale values.',
    ],
    image: '/images/palmjumeirah.webp',
    alt: 'A beachfront villa on Palm Jumeirah',
    facts: { pricePerSqft: 'AED 3,900', rentalYield: '4.5 – 5.5%', airport: '35 min', homes: 'Villas, apartments, penthouses' },
    highlights: [
      { title: 'Private beaches', text: 'Most villas and many apartment buildings have their own beach access.' },
      { title: 'Resort living', text: 'Hotels, beach clubs and restaurants line the crescent and the Golden Mile.' },
      { title: 'Resale depth', text: 'A mature market with consistent demand from international buyers.' },
    ],
  }),
  area({
    name: 'Dubai Marina',
    tagline: 'Waterfront towers, the Marina Walk and the beach on your doorstep.',
    intro: [
      'Dubai Marina wraps around a three-kilometre canal lined with residential towers, restaurants and yachts. It is one of the city’s most established rental markets.',
      'Metro, tram and the beach at JBR are all within walking distance, which keeps demand strong for both long lets and holiday homes.',
    ],
    image: '/images/marina.avif',
    alt: 'A residential tower overlooking Dubai Marina',
    facts: { pricePerSqft: 'AED 2,100', rentalYield: '6 – 7%', airport: '30 min', homes: 'Apartments, penthouses' },
    highlights: [
      { title: 'Walkable', text: 'The Marina Walk links homes, dining, the tram and the beach.' },
      { title: 'Rental demand', text: 'Steady occupancy for both annual and short-stay lets.' },
      { title: 'Views', text: 'Marina, sea and Palm views from the upper floors of most towers.' },
    ],
  }),
  area({
    name: 'Downtown Dubai',
    tagline: 'The Burj Khalifa, Dubai Mall and the Boulevard.',
    intro: [
      'Downtown Dubai is the city’s centre: the Burj Khalifa, the Dubai Fountain and Dubai Mall, surrounded by residential towers along Mohammed Bin Rashid Boulevard.',
      'It attracts professionals working in DIFC and Business Bay, and is one of the strongest holiday-home markets in the city.',
    ],
    image: '/images/downtown.jpeg',
    alt: 'The Downtown Dubai skyline at dusk',
    facts: { pricePerSqft: 'AED 2,800', rentalYield: '5.5 – 6.5%', airport: '15 min', homes: 'Apartments, penthouses' },
    highlights: [
      { title: 'Landmark views', text: 'Burj Khalifa and Fountain views command a premium on resale and rent.' },
      { title: 'Central', text: 'Fifteen minutes from DXB, minutes from DIFC and Business Bay.' },
      { title: 'Short-stay demand', text: 'Tourism keeps holiday-home occupancy high year-round.' },
    ],
  }),
  area({
    name: 'Business Bay',
    tagline: 'Canal-front living between Downtown and DIFC.',
    intro: [
      'Business Bay runs along the Dubai Water Canal beside Downtown Dubai. Residential towers sit alongside offices, hotels and waterside promenades.',
      'Entry prices are lower than Downtown for comparable views, which makes it popular with investors.',
    ],
    image: '/images/bay.webp',
    alt: 'A tower with Burj Khalifa views',
    facts: { pricePerSqft: 'AED 2,000', rentalYield: '6.5 – 7.5%', airport: '15 min', homes: 'Apartments' },
    highlights: [
      { title: 'Canal promenade', text: 'Walking and cycling routes along the Dubai Water Canal.' },
      { title: 'Value', text: 'Downtown views at a lower price per square foot.' },
      { title: 'Investor favourite', text: 'Strong yields from professionals renting close to work.' },
    ],
  }),
  area({
    name: 'Dubai Hills Estate',
    tagline: 'Green, family-focused and built around a championship golf course.',
    intro: [
      'Dubai Hills Estate is a master-planned community of villas, townhouses and apartments set around an 18-hole golf course and a large central park.',
      'Schools, a hospital and Dubai Hills Mall sit within the community, which keeps it in demand with families.',
    ],
    image: '/images/hills.webp',
    alt: 'A contemporary villa set within landscaped gardens',
    facts: { pricePerSqft: 'AED 2,300', rentalYield: '5 – 6%', airport: '25 min', homes: 'Villas, townhouses, apartments' },
    highlights: [
      { title: 'Parks and golf', text: 'Over a third of the community is green space.' },
      { title: 'Schools inside', text: 'Leading international schools within the masterplan.' },
      { title: 'Dubai Hills Mall', text: 'Retail, dining and entertainment within minutes.' },
    ],
  }),
  area({
    name: 'Jumeirah Beach Residence',
    tagline: 'Beachfront apartments along The Walk.',
    intro: [
      'JBR is a strip of residential towers facing one of Dubai’s most popular public beaches, with The Walk’s cafes and shops at street level.',
      'It is one of the most reliable short-stay markets in the city, especially for sea-view apartments.',
    ],
    image: '/images/jbr.jpg',
    alt: 'The Jumeirah beachfront',
    facts: { pricePerSqft: 'AED 2,000', rentalYield: '6 – 7%', airport: '30 min', homes: 'Apartments, penthouses' },
    highlights: [
      { title: 'On the beach', text: 'Direct access to the sand from most towers.' },
      { title: 'The Walk', text: 'Street-level dining and retail along the whole frontage.' },
      { title: 'Holiday-home demand', text: 'Sea-view units are among the city’s best short-stay performers.' },
    ],
  }),
  area({
    name: 'Arabian Ranches',
    tagline: 'Established villa communities with a village feel.',
    intro: [
      'Arabian Ranches is one of Dubai’s most established villa communities, with tree-lined streets, community pools and a golf course.',
      'Newer phases have added contemporary townhouses, keeping the area popular with families looking for space.',
    ],
    image: '/images/ranches.jpg',
    alt: 'A family home with a private garden',
    facts: { pricePerSqft: 'AED 1,500', rentalYield: '5 – 5.5%', airport: '30 min', homes: 'Villas, townhouses' },
    highlights: [
      { title: 'Family living', text: 'Pools, parks and schools within the community.' },
      { title: 'Space', text: 'Generous plots and private gardens at accessible prices.' },
      { title: 'Ranches Souk', text: 'Everyday shopping and dining close to home.' },
    ],
  }),
  area({
    name: 'Dubai Islands',
    tagline: 'A new island destination off the Deira coast.',
    intro: [
      'Dubai Islands is a group of man-made islands being developed into a resort destination with beaches, marinas and hotels.',
      'Early launches have drawn strong interest from buyers looking for beachfront homes at an earlier point in an area’s growth.',
    ],
    image: '/images/island.webp',
    alt: 'A waterfront villa with a private pool at dusk',
    facts: { pricePerSqft: 'AED 1,900', rentalYield: 'Off-plan', airport: '20 min', homes: 'Villas, townhouses, apartments' },
    highlights: [
      { title: 'Beachfront', text: 'Kilometres of new beaches across the islands.' },
      { title: 'Early stage', text: 'Off-plan prices ahead of the area’s completion.' },
      { title: 'Close to DXB', text: 'Twenty minutes from Dubai International Airport.' },
    ],
  }),
  area({
    name: 'Palm Jebel Ali',
    tagline: 'The next Palm, now launching.',
    intro: [
      'Palm Jebel Ali is Nakheel’s second palm island, larger than Palm Jumeirah and planned around beachfront villas and resorts.',
      'First villa releases sold quickly, and further phases are expected through the coming years.',
    ],
    image: '/images/jebelali.jpeg',
    alt: 'A beachfront residence rendering',
    facts: { pricePerSqft: 'AED 3,000', rentalYield: 'Off-plan', airport: '35 min (DWC)', homes: 'Villas' },
    highlights: [
      { title: 'Beach plots', text: 'Every frond villa planned with direct beach access.' },
      { title: 'Scale', text: 'Larger than Palm Jumeirah, with space for wider plots.' },
      { title: 'Long-term growth', text: 'Buying early in a new island’s story.' },
    ],
  }),
  area({
    name: 'Dubai Creek Harbour',
    tagline: 'Waterfront towers with skyline views across the Creek.',
    intro: [
      'Dubai Creek Harbour is a waterfront district on the banks of Dubai Creek, next to the Ras Al Khor wildlife sanctuary.',
      'Apartments look back across the water to the Downtown skyline, and the masterplan includes parks, promenades and retail.',
    ],
    image: '/images/creek.jpg',
    alt: 'An aerial view of the Dubai skyline at dusk',
    facts: { pricePerSqft: 'AED 2,100', rentalYield: '6 – 7%', airport: '10 min', homes: 'Apartments' },
    highlights: [
      { title: 'Skyline views', text: 'Views across the Creek to Downtown and the Burj Khalifa.' },
      { title: 'Close to DXB', text: 'Ten minutes from Dubai International Airport.' },
      { title: 'Green space', text: 'Parks and a nature reserve beside the community.' },
    ],
  }),
  area({
    name: 'JVC',
    tagline: 'Jumeirah Village Circle: value and dependable rental demand.',
    intro: [
      'Jumeirah Village Circle is a community of apartments, townhouses and villas around landscaped parks, between Al Khail Road and Sheikh Mohammed Bin Zayed Road.',
      'Accessible entry prices and steady tenant demand make it one of the most-transacted areas for investors.',
    ],
    image: '/images/jvc.jpeg',
    alt: 'A contemporary residential building',
    facts: { pricePerSqft: 'AED 1,200', rentalYield: '7 – 8%', airport: '30 min', homes: 'Apartments, townhouses' },
    highlights: [
      { title: 'High yields', text: 'Among the strongest gross yields in the city.' },
      { title: 'Parks', text: 'Over thirty parks and play areas across the circle.' },
      { title: 'Connected', text: 'Quick access to the Marina, Al Barsha and Downtown.' },
    ],
  }),
  area({
    name: 'Mohammed Bin Rashid City',
    tagline: 'Lagoons, parks and low-rise living ten minutes from Downtown.',
    intro: [
      'Mohammed Bin Rashid City is a large master-planned district of villas and apartments built around crystal lagoons and green spaces.',
      'Its central location and family amenities make it one of the most active off-plan areas in Dubai.',
    ],
    image: '/images/mbr.jpg',
    alt: 'The Dubai skyline seen across the city',
    facts: { pricePerSqft: 'AED 1,900', rentalYield: '5.5 – 6.5%', airport: '20 min', homes: 'Villas, apartments' },
    highlights: [
      { title: 'Lagoons', text: 'Swimmable lagoons and beaches inside the community.' },
      { title: 'Central', text: 'Ten minutes from Downtown Dubai.' },
      { title: 'Schools', text: 'International schools within the masterplan.' },
    ],
  }),
];

export const getArea = (slug: string) => areas.find((a) => a.slug === slug);
export const areaHref = (name: string) => `/areas/${toSlug(name)}`;
