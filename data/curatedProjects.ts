/**
 * Off-plan projects D|R|P added by hand, alongside the ones imported from the
 * DRP website (data/imported/projects.json). Kept separate so that
 * `npm run import:drp` does not overwrite them.
 *
 * Researched October 2026 from the developers' announcements and their Property
 * Finder project pages (`sourceUrl`). CONFIRM – starting prices, payment plans
 * and handover dates with the developer before quoting them to a client.
 * Images are the developers' renders, saved under /public/media/projects/.
 */
import type { Project } from './offPlan';

const gallery = (slug: string, name: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    src: `/media/projects/${slug}/${i + 1}.webp`,
    alt: `${name}, image ${i + 1}`,
  }));

export const curatedProjects: Project[] = [
  {
    slug: 'solaya-la-mer',
    name: 'Solaya',
    developer: 'Meraas',
    area: 'Jumeirah',
    collections: ['Luxury', 'Latest Launch'],
    propertyTypes: ['Apartment', 'Penthouse'],
    bedrooms: [2, 3, 4, 5],
    fromPrice: 14_200_000,
    handoverYear: 2029,
    paymentPlan: '60/40',
    launchedAt: '2026-10-15',
    description: [
      'Solaya is a beachfront collection of 234 residences across nine low-rise buildings on La Mer, Jumeirah, developed by Meraas with Brookfield. The architecture is by Foster + Partners and the interiors by 1508 London.',
      'Homes range from two- to five-bedroom apartments and duplexes with deep terraces to penthouses with private lobbies and lifts, and 18 garden houses with their own infinity pools and courtyards.',
    ],
    highlights: [
      { title: 'Beachfront', text: 'Low-rise residences set directly on the La Mer shoreline in Jumeirah 1.' },
      { title: 'Foster + Partners', text: 'Architecture by Foster + Partners, interiors by 1508 London.' },
      { title: 'Garden Houses', text: '18 garden houses with private infinity pools and courtyards.' },
      { title: 'Resort Amenities', text: 'Private beach access, spa, fitness club, residents’ lounges and dining.' },
    ],
    locationText: [
      'La Mer is a beachfront destination in Jumeirah 1, with cafés, restaurants and a waterpark along the sand, and Burj Khalifa and Downtown Dubai about 15 minutes away.',
    ],
    image: '/media/projects/solaya-la-mer/1.webp',
    alt: 'Solaya, La Mer, Jumeirah',
    gallery: gallery('solaya-la-mer', 'Solaya', 6),
    map: { query: 'Solaya, La Mer, Jumeirah, Dubai, United Arab Emirates', exact: false },
    sourceUrl: 'https://www.propertyfinder.ae/en/new-projects/meraas-holding/solaya-in-la-mer',
  },
  {
    slug: 'jumeirah-residences-emirates-towers',
    name: 'Jumeirah Residences Emirates Towers',
    developer: 'Meraas',
    area: 'Sheikh Zayed Road',
    collections: ['Luxury', 'Latest Launch'],
    propertyTypes: ['Apartment'],
    bedrooms: [1, 2, 3, 4],
    // CONFIRM – brokers list from AED 3.51M (1 bed); Property Finder's project
    // page shows AED 20.66M, which is a 3-bedroom
    fromPrice: 3_510_000,
    handoverYear: 2030,
    paymentPlan: '60/40',
    launchedAt: '2026-10-15',
    description: [
      'Jumeirah Residences Emirates Towers brings Jumeirah-serviced homes to the Emirates Towers district on Sheikh Zayed Road, developed by Meraas next to the Museum of the Future and DIFC.',
      'One- to four-bedroom apartments come with skyline views, sky infinity pools, a spa and wellness studios, private cinema and residents’ lounges, all run to Jumeirah’s hotel standard.',
    ],
    highlights: [
      { title: 'Jumeirah Branded', text: 'Residences serviced by Jumeirah, Dubai’s own luxury hotel group.' },
      { title: 'Landmark Address', text: 'Beside Emirates Towers and the Museum of the Future, minutes from DIFC.' },
      { title: 'Sky Amenities', text: 'Sky infinity pools, spa, sauna, gym, cinema and residents’ lounges.' },
      { title: 'Connected', text: 'Walk to Emirates Towers Metro; 15 minutes from Dubai International Airport.' },
    ],
    locationText: [
      'Sheikh Zayed Road at Emirates Towers sits between DIFC, Downtown Dubai and City Walk, with the metro on the doorstep and the airport about 15 minutes away.',
    ],
    image: '/media/projects/jumeirah-residences-emirates-towers/1.webp',
    alt: 'Jumeirah Residences Emirates Towers, Sheikh Zayed Road',
    gallery: gallery('jumeirah-residences-emirates-towers', 'Jumeirah Residences Emirates Towers', 6),
    map: { query: 'Emirates Towers, Sheikh Zayed Road, Dubai, United Arab Emirates', exact: false },
    sourceUrl: 'https://www.propertyfinder.ae/en/new-projects/meraas-holding/jumeirah-residences-emirates-towers',
  },
  {
    slug: 'akala-hotel-residences',
    name: 'Akala Hotel & Residences',
    developer: 'Arada',
    area: 'Zabeel 1&2',
    collections: ['Luxury'],
    propertyTypes: ['Apartment', 'Penthouse'],
    bedrooms: [1, 2, 3, 4, 6],
    fromPrice: 3_905_000,
    handoverYear: 2029,
    paymentPlan: '40/60',
    launchedAt: '2026-10-15',
    description: [
      'Akala Hotel & Residences is Arada’s precision-wellness destination: two 220-metre towers between DIFC and Downtown Dubai, one a hotel and the other 534 branded residences.',
      'Homes run from one-bedroom apartments to The Observatory, a six-bedroom penthouse over two floors with Burj Khalifa views. Each has air and water purification, circadian lighting and zoned climate control, with a medical clinic, spa and wellness studios in the podium.',
    ],
    highlights: [
      { title: 'Wellness Living', text: 'Air and water purification, circadian lighting and organic sleep systems.' },
      { title: 'Everwell Clinic', text: 'On-site medical clinic with diagnostics and longevity programmes.' },
      { title: 'Akala Spa', text: 'Saunas, hammams and thalassotherapy pools in the shared podium.' },
      { title: 'Central', text: 'Between DIFC and Downtown Dubai; LEED Gold and WELL Silver precertified.' },
    ],
    locationText: [
      'Zabeel 2 sits just behind DIFC and Downtown Dubai, with Sheikh Zayed Road, Zabeel Park and Dubai International Airport all a short drive away.',
    ],
    image: '/media/projects/akala-hotel-residences/1.webp',
    alt: 'Akala Hotel & Residences, beside DIFC',
    gallery: gallery('akala-hotel-residences', 'Akala Hotel & Residences', 5),
    map: { query: 'Akala Hotel & Residences, Zabeel 2, Dubai, United Arab Emirates', exact: false },
    sourceUrl: 'https://www.propertyfinder.ae/en/new-projects/arada-sale/akala-hotel-and-residences',
  },
  {
    slug: 'inaura-downtown',
    name: 'Inaura Downtown',
    developer: 'Arada',
    area: 'Downtown Dubai',
    collections: ['Luxury', 'Latest Launch'],
    propertyTypes: ['Apartment', 'Penthouse', 'Villa'],
    bedrooms: [1, 2, 3, 4, 5, 6],
    fromPrice: 3_599_000,
    handoverYear: 2030,
    paymentPlan: '50/50',
    launchedAt: '2026-10-15',
    description: [
      'Inaura Downtown is Arada’s fitness-led hotel and branded residences tower in Downtown Dubai: 114 residences in a 42-floor, 200-metre tower designed by MVRDV.',
      'Homes range from one- to four-bedroom apartments to two five-bedroom duplex Sky Villas and a three-storey, six-bedroom Sky Penthouse, with a central orb of dining and social spaces looking out over Burj Khalifa and Business Bay.',
    ],
    highlights: [
      { title: 'Designed by MVRDV', text: 'A 42-floor tower with a signature orb of social and dining space.' },
      { title: 'Fitness-Led', text: 'Spa with cryotherapy and hydrotherapy, medical clinic and training studios.' },
      { title: 'Sky Homes', text: 'Duplex Sky Villas and a three-storey Sky Penthouse at the top.' },
      { title: 'Downtown', text: 'Steps from Burj Khalifa, The Dubai Mall and Dubai Opera.' },
    ],
    locationText: [
      'Downtown Dubai is the city’s central district, home to Burj Khalifa, The Dubai Mall and Dubai Opera, with Business Bay and DIFC next door.',
    ],
    image: '/media/projects/inaura-downtown/2.webp',
    alt: 'Inaura Downtown, Downtown Dubai',
    gallery: gallery('inaura-downtown', 'Inaura Downtown', 6),
    map: { query: 'Inaura Downtown, Downtown Dubai, Dubai, United Arab Emirates', exact: false },
    sourceUrl: 'https://www.propertyfinder.ae/en/new-projects/arada-sale/inaura-hotels-and-residences',
  },
];
