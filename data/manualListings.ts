/**
 * Listings DRP adds to the website by hand, from its own brochures, that are
 * not on Property Finder. They sort with the rest by date; photos live in
 * /public/media/<listing>/.
 */

import type { Listing } from './properties';

const sensoriaPhotos: string[] = [
  'The private terrace lounge at sunset, looking out to Ain Dubai and the sea',
  'The living room, with floor-to-ceiling windows over JBR and the sea',
  'The living room seating, with sea views through the glazing',
  'The dining table for eight beside the kitchen',
  'The kitchen, with a stone island and built-in appliances',
  'The master bedroom, opening onto the terrace and private pool',
  'The master bathroom, with a freestanding stone bath',
  'The terrace lounge, planted with olive trees',
  'The private pool on the terrace at dusk',
  'The terrace lounge at night, with Ain Dubai lit up across the water',
  'The sea view from the terrace, over Bluewaters and the marina',
  'The second bedroom, with sea views',
  'The third bedroom, opening onto the terrace',
  'The third bedroom, with a walk-in wardrobe',
  'Ain Dubai and Bluewaters at night, seen from the residence',
  'The Dubai Marina towers at dusk, from the residence',
  'The Five Luxe beach club and pools on JBR beach, from above',
];

export const manualListings: Listing[] = [
  {
    slug: 'sensoria-five-luxe-3-bedroom-private-pool-jbr',
    ref: 'DRP-SENSORIA-3BR',
    permit: null,
    permitUrl: null,
    title: 'Sensoria at Five Luxe | 3-Bedroom Residence with Private Pool | Full Sea View',
    offering: 'buy',
    price: 17_900_000,
    type: 'Apartment',
    area: 'Jumeirah Beach Residence',
    building: 'Sensoria at Five Luxe',
    map: { query: 'Five Luxe JBR, Dubai', exact: false },
    beds: 3,
    baths: 4,
    size: 3196,
    completion: 'Ready',
    furnishing: 'Furnished',
    listedAt: '2026-10-30',
    agent: null,
    images: sensoriaPhotos.map((alt, i) => ({
      src: `/media/sensoria-five-luxe/${String(i + 1).padStart(2, '0')}.webp`,
      alt,
    })),
    description: [
      'A fully furnished 3-bedroom residence at Sensoria, Five Luxe, with a private terrace and pool overlooking Ain Dubai, JBR beach and the open sea, for sale.',
      'High on the tower, the living room, kitchen and bedrooms open onto the terrace, and every room takes in the sea. Ready to move in, sold furnished, with the Five Luxe resort lifestyle on the JBR beachfront.',
      '3,196 sq ft in total. Service charge AED 40 per sq ft.',
    ],
    features: [
      'Private pool on the terrace',
      'Full sea view: Ain Dubai and JBR beach',
      'Fully furnished',
      'Ready to move in',
      'High floor',
      'Five Luxe resort facilities',
      'JBR beachfront',
    ],
    sourceUrl: 'https://dubairapidproperties.com/properties/sensoria-five-luxe-3-bedroom-private-pool-jbr',
  },
];
