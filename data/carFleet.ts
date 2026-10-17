/**
 * ============================================================================
 *  DRP CAR FLEET — /ecosystem/car-fleet
 * ============================================================================
 *  An added service for DRP owners, Holiday Homes guests and clients — not a
 *  rental business. No prices, booking or dates; every route leads to the
 *  team.
 *
 *  The fleet is one model, the VGV U70 Pro. Specs are the manufacturer's UAE
 *  figures (ZigWheels UAE / CarNewsChina); confirm the seat count of DRP's own
 *  car (the U70 Pro comes as a 5- or 7-seater).
 *
 *  PHOTOS: the hero and every exterior photo are DRP's own branded car. The
 *  interior photos are manufacturer press images (public/images/car-fleet/);
 *  interior-1, -2 and -5 show the D|R|P website on the touchscreen.
 *  Replace a file with DRP's own interior shot, keeping the name, or edit
 *  the list.
 * ============================================================================
 */

export type CarPhoto = { src: string; alt: string };

const photo = (file: string, alt: string): CarPhoto => ({ src: `/images/car-fleet/${file}`, alt });

export const carFleet = {
  metaTitle: 'Car Fleet | Dubai Rapid Properties',
  hero: {
    eyebrow: 'D|R|P Car Fleet',
    heading: 'Mobility, Part of\nthe D|R|P Experience',
    // REAL – DRP's own VGV U70 Pro outside the office
    image: '/images/car-fleet/drp-office.webp',
    imageAlt: 'The D|R|P-branded VGV U70 Pro outside the D|R|P office',
  },
  intro:
    'Our D|R|P car fleet is available as an additional service for our property owners, Holiday Homes guests and clients who require convenient mobility during their stay in Dubai. Speak to our team to learn more about available vehicles and arrangements.',

  car: {
    eyebrow: 'The D|R|P Car',
    make: 'VGV',
    model: 'U70 Pro',
    type: 'Mid-size SUV',
    description: [
      'A spacious family SUV with room for passengers and luggage, chosen for comfortable airport runs, viewings and days out across Dubai.',
      'Leather seats, a panoramic sunroof and a 10.25-inch touchscreen make every journey easy, whether you are arriving for a stay or seeing properties with our team.',
    ],
    image: photo('drp-front.webp', 'The D|R|P-branded VGV U70 Pro outside the D|R|P office'),
    specs: [
      // CONFIRM – the U70 Pro comes as a 5- or 7-seater
      { label: 'Seats', value: '5 or 7' },
      { label: 'Engine', value: '1.5L turbo' },
      { label: 'Power', value: '154 hp' },
      { label: 'Transmission', value: '6-speed automatic' },
      { label: 'Length', value: '4,825 mm' },
      { label: 'Ground clearance', value: '200 mm' },
    ],
  },

  gallery: {
    eyebrow: 'Gallery',
    heading: 'Inside and Out',
    // REAL – DRP's own car
    exterior: [
      photo('drp-front.webp', 'The D|R|P-branded VGV U70 Pro from the front three-quarter, outside the D|R|P office'),
      photo('drp-office.webp', 'Side profile of the D|R|P-branded VGV U70 Pro outside the D|R|P office'),
      photo('drp-rear-side.webp', 'Rear three-quarter view, the D|R|P livery and QR codes'),
      photo('drp-rear-quarter.webp', 'Rear three-quarter view from the other side, on the Palm Jumeirah'),
      photo('drp-rear.webp', 'Rear view, with the D|R|P website address and QR codes'),
    ],
    // TEMPORARY – manufacturer press photos; swap for DRP's own shots
    interior: [
      photo('interior-1.webp', 'Dashboard and front cabin'),
      photo('interior-2.webp', 'Centre console and touchscreen'),
      photo('interior-4.webp', 'Gear selector and leather console'),
      photo('interior-5.webp', '10.25-inch touchscreen'),
      photo('interior-6.webp', 'Boot with the tailgate open'),
    ],
  },

  features: {
    eyebrow: 'On Board',
    heading: 'Comfort as Standard',
    items: [
      { title: 'Panoramic sunroof', text: 'Light-filled cabin for the drive along the coast.' },
      { title: '10.25-inch touchscreen', text: 'Navigation, music and calls on one clear display.' },
      { title: 'Digital instrument cluster', text: 'Everything the driver needs, at a glance.' },
      { title: 'Leather seating', text: 'Comfortable for longer journeys across the city.' },
      { title: 'Voice control', text: 'Hands-free operation of the main functions.' },
      { title: 'Hill-start and descent assist', text: 'Calm, controlled driving on every gradient.' },
    ],
  },

  service: {
    eyebrow: 'How It Works',
    heading: 'Arranged by the D|R|P Team',
    steps: [
      { title: 'Ask the team', text: 'Tell us your dates and what you need the car for — a stay, a viewing day or airport transfers.' },
      { title: 'We confirm', text: 'We check availability and set out the arrangement with you directly.' },
      { title: 'Ready when you are', text: 'The car is prepared and handed over where and when it suits you.' },
    ],
    note: 'Available to D|R|P property owners, Holiday Homes guests and clients.',
  },

  cta: {
    eyebrow: 'Car Fleet Enquiries',
    heading: 'Speak to our team',
    label: 'Contact Us',
    href: '/contact',
    whatsappText: 'Hello D|R|P, I would like to ask about the D|R|P car (VGV U70 Pro).',
  },
};
