/**
 * ============================================================================
 *  SERVICE PAGES — holiday homes, property management, furnishings,
 *  interior design, fit-out
 * ============================================================================
 *  DEMO PLACEHOLDERS – package prices, management fees, nightly rates and
 *  performance figures are illustrative. Confirm with DRP before launch.
 * ============================================================================
 */

import { unsplash } from '@/lib/media';
import { contactStep, type LeadFormConfig } from './leadPages';
import { searchData } from './homepage';
import { dubaiAreas } from './dubaiAreas';

export type Package = {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

const bedroomChoices = searchData.beds.map((b) => ({
  value: b,
  label: b === 'Studio' ? 'Studio' : b === '1' ? '1 Bedroom' : `${b} Bedrooms`,
}));

const typeChoices = ['Apartment', 'Villa', 'Townhouse', 'Penthouse'].map((v) => ({ value: v, label: v }));

const areaStep = {
  id: 'area',
  label: 'Area',
  question: 'Where is the property?',
  kind: 'select' as const,
  placeholder: 'Type or choose an area',
  options: dubaiAreas,
};

/* -------------------------------------------------------------------------- */
/*  HOLIDAY HOMES                                                             */
/* -------------------------------------------------------------------------- */

export const holidayHomes = {
  hero: {
    eyebrow: 'D|R|P Holiday Homes',
    heading: 'Holiday Homes in Dubai',
    intro:
      'Licensed short-stay rentals across Palm Jumeirah, Dubai Marina and Downtown — for guests looking for a home, and owners looking for returns.',
    image: unsplash('1567767292278-a4f21aa2d36e', 2000),
    imageAlt: 'The living room of a furnished Dubai holiday home',
  },
  stats: [
    { value: '24/7', label: 'Guest support' },
    { value: '150+', label: 'Homes managed' },
  ],
  owners: {
    eyebrow: 'For Owners',
    heading: 'Earn more from your property',
    paragraphs: [
      'We furnish, photograph, list and manage your home on every major booking platform, with pricing that moves daily with demand.',
      'You see bookings, earnings and statements in the owner portal, and our team handles guests, cleaning and maintenance.',
    ],
    bullets: ['DTCM licensing handled', 'Dynamic pricing', 'Professional photography', 'Monthly statements'],
    image: unsplash('1512917774080-9991f1c4c750', 1600),
    imageAlt: 'A furnished living space opening onto a terrace',
  },
  guests: {
    eyebrow: 'For Guests',
    heading: 'Stay like a resident',
    paragraphs: [
      'Serviced apartments and villas with hotel-standard housekeeping, self check-in and a local team on call around the clock.',
      'Add airport transfers or a car from the D|R|P car fleet for the length of your stay.',
    ],
    bullets: ['Self check-in', 'Hotel-standard linen', 'Local concierge', 'Car fleet on request'],
    image: unsplash('1564013799919-ab600027ffc6', 1600),
    imageAlt: 'A sunlit holiday home terrace with sea views',
  },
  ownerSteps: [
    { title: 'Assessment', text: 'We visit, estimate earnings and recommend any furnishing needed.' },
    { title: 'Set up', text: 'Licensing, furnishing, photography and listings on every platform.' },
    { title: 'Guests', text: 'Pricing, bookings, check-ins, cleaning and maintenance, all handled.' },
    { title: 'Returns', text: 'Monthly payouts and statements, visible in the owner portal.' },
  ],
  faqs: [
    { q: 'Do I need a licence to rent short-stay in Dubai?', a: 'Yes. Holiday homes must be registered with Dubai’s Department of Economy and Tourism. D|R|P handles the registration and renewals for owners.' },
    { q: 'Can I still use my home myself?', a: 'Yes. Block dates in the owner portal and we keep them free of bookings.' },
    { q: 'What does D|R|P charge?', a: 'A percentage of booking revenue, agreed after we assess the property. There are no listing fees.' }, // DEMO PLACEHOLDER — confirm the fee structure
    { q: 'Who looks after the guests?', a: 'Our guest experience team, 24 hours a day, with housekeeping and maintenance partners on call.' },
  ],
};

/* -------------------------------------------------------------------------- */
/*  HOLIDAY HOMES — LIST YOUR PROPERTY                                        */
/* -------------------------------------------------------------------------- */

export const holidayListForm: LeadFormConfig = {
  formId: 'holiday-homes-list',
  submitLabel: 'Get My Estimate',
  successTitle: 'Thank you.',
  successBody: 'A D|R|P Holiday Homes specialist will contact you with an earnings estimate for your property.',
  steps: [
    { id: 'propertyType', label: 'Property Type', question: 'What type of property is it?', kind: 'choice', columns: 2, options: typeChoices },
    areaStep,
    { id: 'bedrooms', label: 'Bedrooms', question: 'How many bedrooms?', kind: 'choice', columns: 3, options: bedroomChoices },
    {
      id: 'furnished',
      label: 'Furnishing',
      question: 'Is the property furnished?',
      kind: 'choice',
      columns: 3,
      options: [
        { value: 'Furnished', label: 'Yes, furnished' },
        { value: 'Partly furnished', label: 'Partly' },
        { value: 'Unfurnished', label: 'Not yet' },
      ],
    },
    contactStep({ id: 'needsFurnishing', label: 'I would like a furnishing quote too' }),
  ],
};

export const holidayList = {
  hero: {
    eyebrow: 'Holiday Homes',
    heading: 'List Your Holiday Home With D|R|P',
    intro:
      'From licensing and furnishing to guests and statements: tell us about your property and we will estimate what it could earn.',
    image: unsplash('1564013799919-ab600027ffc6', 2000),
    imageAlt: 'A sunlit holiday home terrace with sea views',
  },
  included: [
    { title: 'Licensing', text: 'Holiday-home registration and renewals with the Department of Economy and Tourism.' },
    { title: 'Listings', text: 'Professional photography and listings on Airbnb, Booking.com and more.' },
    { title: 'Pricing', text: 'Daily rate optimisation for seasons, events and booking pace.' },
    { title: 'Guests', text: '24/7 guest communication, check-in and concierge.' },
    { title: 'Housekeeping', text: 'Hotel-standard cleaning and linen between every stay.' },
    { title: 'Reporting', text: 'Bookings, earnings and statements in the owner portal.' },
  ],
};

/* -------------------------------------------------------------------------- */
/*  PROPERTY MANAGEMENT                                                       */
/* -------------------------------------------------------------------------- */

export const propertyManagement = {
  hero: {
    eyebrow: 'Property Management',
    heading: 'How Does It Work?',
    intro:
      'Letting, maintenance, renewals and reporting handled end to end, so owners in Dubai or abroad never need to manage a tenant themselves.',
    image: '/images/inside.webp',
    imageAlt: 'A bright, furnished living room in a Dubai apartment',
  },
  intro: [
    'Most of our management clients live outside the UAE. They need one team they can trust to find the right tenant, collect the rent and look after the property as if it were their own.',
    'D|R|P manages apartments, villas and townhouses across Dubai, on annual leases or as holiday homes, with everything visible in the owner portal.',
  ],
  steps: [
    { title: 'Appraisal', text: 'We visit, advise on rent and any work that will help it let faster.' },
    { title: 'Letting', text: 'Marketing, viewings, tenant checks, Ejari and the tenancy contract.' },
    { title: 'Management', text: 'Rent collection, maintenance, inspections and service charges.' },
    { title: 'Renewal', text: 'Rent reviews, renewals or a smooth handover between tenants.' },
  ],
  services: [
    { title: 'Tenant finding', text: 'Listings on every major portal and vetted applicants only.' },
    { title: 'Rent collection', text: 'Cheques banked on time and paid out with a clear statement.' },
    { title: 'Maintenance', text: 'A network of vetted contractors, with your approval above a set limit.' },
    { title: 'Inspections', text: 'Move-in, mid-term and move-out inspections with photo reports.' },
    { title: 'Compliance', text: 'Ejari registration, DEWA and service charge payments.' },
    { title: 'Owner portal', text: 'Statements, documents and maintenance requests in one place.' },
  ],
  packages: [
    {
      name: 'Letting Only',
      price: '',
      description: 'We find and contract the tenant; you manage the tenancy.',
      features: ['Marketing and viewings', 'Tenant checks', 'Ejari and contract'],
    },
    {
      name: 'Full Management',
      price: '',
      description: 'Letting plus everything that follows, for the whole tenancy.',
      features: ['Everything in Letting Only', 'Rent collection', 'Maintenance and inspections', 'Renewals', 'Owner portal'],
      featured: true,
    },
    {
      name: 'Holiday Home',
      price: 'Share of booking revenue',
      description: 'Short-stay management with D|R|P Holiday Homes.',
      features: ['Licensing', 'Dynamic pricing', 'Guests and housekeeping', 'Monthly payouts'],
    },
  ] satisfies Package[],
  faqs: [
    { q: 'I live abroad. Can you manage everything?', a: 'Yes. Most of our management clients are overseas. You sign documents digitally and see everything in the owner portal.' },
    { q: 'How quickly can you let my property?', a: 'Well-priced, well-presented homes in popular areas typically let within a few weeks. We will advise on price and presentation at the appraisal.' },
    { q: 'Who approves maintenance costs?', a: 'You set an approval limit. Anything above it needs your sign-off, with quotes attached.' },
    { q: 'Can I switch from annual letting to a holiday home?', a: 'Yes, at the end of a tenancy. We will compare the expected returns of both for your property.' },
  ],
  form: {
    formId: 'property-management',
    submitLabel: 'Request an Appraisal',
    successTitle: 'Thank you.',
    successBody: 'A D|R|P property manager will contact you to arrange an appraisal.',
    steps: [
      {
        id: 'service',
        label: 'Service',
        question: 'Which service are you interested in?',
        kind: 'choice',
        columns: 3,
        options: [
          { value: 'Letting Only', label: 'Letting only' },
          { value: 'Full Management', label: 'Full management' },
          { value: 'Holiday Home', label: 'Holiday home' },
        ],
      },
      { id: 'propertyType', label: 'Property Type', question: 'What type of property is it?', kind: 'choice', columns: 2, options: typeChoices },
      areaStep,
      contactStep(),
    ],
  } satisfies LeadFormConfig,
};

/* -------------------------------------------------------------------------- */
/*  FURNISHINGS                                                               */
/* -------------------------------------------------------------------------- */

/** The furnishing packages, shown on /drp-furnishing. */
export const furnishings = {
  intro: [
    'A well-furnished home lets faster, earns more per night and photographs better. Our packages are designed for exactly that: hard-wearing, easy to maintain and consistent with what tenants and guests expect in Dubai.',
    'Every package includes design, procurement, delivery, installation and final styling, so the property is ready to photograph the day we hand it back.',
  ],
  packages: [
    {
      name: 'Essential',
      price: 'Starting From AED 22,990',
      description: 'Complete, durable furnishing for annual lets.',
      features: ['Smart, functional furniture', 'Basic kitchen essentials', 'Quality linen & towels', 'Smart TV & Wi-Fi setup', 'Installation & quality check'],
    },
    {
      name: 'Signature',
      price: 'Starting From AED 30,990',
      description: 'Our holiday-home standard, designed to photograph well.',
      features: ['Premium furniture & finishes', 'High-end kitchen equipment', 'Luxury linen & towels', 'Premium décor & accessories', 'Installation & quality check'],
      featured: true,
    },
    {
      name: 'Bespoke',
      price: 'By quotation',
      description: 'Full interior design for prime villas and penthouses.',
      features: ['Dedicated interior designer', 'Custom joinery', 'Sourced and imported pieces', 'Project management'],
    },
  ] satisfies Package[],
};

/** Why furnishing matters, shown on /drp-furnishing. */
export const whyItMatters = {
  intro: [
    'Guests and tenants decide in seconds, from a single listing photo. A home that looks considered, comfortable and well kept wins the click, the booking and, more often, the five-star review that keeps bookings coming.',
    'Across the holiday homes we manage, professionally furnished properties consistently earn more per night and spend fewer nights empty than comparable homes with dated or mismatched interiors.',
  ],
  reasons: [
    { title: 'Occupancy', text: 'Better listings rank higher on booking platforms and fill more nights.' },
    { title: 'Nightly rate', text: 'A well-designed home can command a premium over similar units.' },
    { title: 'Reviews', text: 'Comfort and cleanliness drive ratings, which drive future bookings.' },
    { title: 'Durability', text: 'Commercial-grade pieces last longer and cost less to maintain.' },
    { title: 'Faster lets', text: 'Annual tenants move in sooner when a home is ready to live in.' },
    { title: 'Resale', text: 'Staged, furnished homes photograph better and attract more viewings.' },
  ],
};

/* -------------------------------------------------------------------------- */
/*  INTERIOR DESIGN                                                           */
/* -------------------------------------------------------------------------- */

export const interiorDesign = {
  hero: {
    eyebrow: 'D|R|P Furnishing',
    heading: 'Interiors That Work as Hard as They Look',
    intro:
      'Concept, sourcing and styling for owners preparing a home to live in, to let or to sell.',
    // REAL – from the current DRP Interior Design page
    image: '/images/furnishing1.jpeg',
    imageAlt: 'A living room styled by D|R|P Interiors',
  },
  /** REAL – the Signature and Essentials package images from the current DRP site */
  /**
   * Two galleries side by side, left to right: Essentials, then Signature.
   * To add photos, put them in /public/images/furnishing/<essentials|signature>/
   * and list them below; arrows and thumbnails appear from the second photo.
   */
  showcase: [
    {
      name: 'Essentials',
      text: 'Complete, durable furnishing for annual lets.',
      // REAL – from the current DRP Interior Design page
      images: [
        { src: '/media/2026/07/image.jpg', alt: 'A living and dining space from the D|R|P Essentials package' },
        // REAL – supplied by DRP
        { src: '/images/furnishing/essentials/essentials-1.webp', alt: 'An Essentials living room in soft neutrals with a city view' },
        { src: '/images/furnishing/essentials/essentials-2.webp', alt: 'An Essentials corner sofa with a marble coffee table and marina view' },
        { src: '/images/furnishing/essentials/essentials-3.webp', alt: 'An Essentials living and dining room with an open kitchen' },
        { src: '/images/furnishing/essentials/essentials-4.webp', alt: 'An Essentials living room with a boucle sofa and dining area' },
        { src: '/images/furnishing/essentials/essentials-5.webp', alt: 'An Essentials living room with a crystal chandelier and skyline views' },
      ],
    },
    {
      name: 'Signature',
      text: 'Our holiday-home standard, designed to photograph well.',
      // REAL – from the current DRP Interior Design page
      images: [
        { src: '/media/2026/07/image.webp', alt: 'A living room from the D|R|P Signature package' },
        // REAL – supplied by DRP
        { src: '/images/furnishing/signature/signature-1.webp', alt: 'A Signature living room with a sculptural chandelier and skyline views' },
        { src: '/images/furnishing/signature/signature-2.webp', alt: 'A double-height Signature villa living room with a marble feature wall' },
        { src: '/images/furnishing/signature/signature-3.webp', alt: 'A Signature living room at night with a marble coffee table and lit shelving' },
        { src: '/images/furnishing/signature/signature-4.webp', alt: 'A Signature majlis with a marble wall and green velvet chairs' },
        { src: '/images/furnishing/signature/signature-5.webp', alt: 'A Signature lounge with lit shelving and a curved sofa' },
      ],
    },
  ],
  intro: [
    'D|R|P Interiors designs homes with a clear purpose. A family villa, a holiday apartment and a property going to market each need something different, and we design for the outcome as much as the look.',
    'Because we also sell, let and manage property, our designers know what buyers, tenants and guests in Dubai respond to, and what lasts.',
  ],
  services: [
    { title: 'Full interior design', text: 'Space planning, finishes, furniture and lighting for a complete home.' },
    { title: 'Rental-ready', text: 'Durable, attractive interiors that let quickly and photograph well.' },
    { title: 'Styling for sale', text: 'Staging that helps a property sell faster and closer to asking.' },
    { title: 'Holiday homes', text: 'Interiors designed around guest comfort, reviews and nightly rates.' },
  ],
  steps: [
    { title: 'Brief', text: 'We meet at the property to understand how it will be used and the budget.' },
    { title: 'Concept', text: 'Mood boards, layouts and a costed specification for approval.' },
    { title: 'Sourcing', text: 'Procurement from our suppliers and partners, tracked to delivery.' },
    { title: 'Installation', text: 'Delivery, installation and final styling, project-managed throughout.' },
  ],
  form: {
    formId: 'drp-furnishing',
    submitLabel: 'Send Enquiry',
    successTitle: 'Thank you.',
    successBody: 'A D|R|P interiors specialist will contact you to arrange a survey or consultation.',
    steps: [
      {
        id: 'package',
        label: 'Service',
        question: 'What are you interested in?',
        kind: 'choice',
        columns: 2,
        options: [
          { value: 'Essential package', label: 'Essential package' },
          { value: 'Signature package', label: 'Signature package' },
          { value: 'Bespoke design', label: 'Bespoke design' },
          { value: 'Not sure yet', label: 'Not sure yet' },
        ],
      },
      {
        id: 'purpose',
        label: 'Purpose',
        question: 'What is the project for?',
        kind: 'choice',
        columns: 2,
        options: [
          { value: 'My own home', label: 'My own home' },
          { value: 'Rental', label: 'A rental property' },
          { value: 'Holiday home', label: 'A holiday home' },
          { value: 'Sale', label: 'Preparing to sell' },
        ],
      },
      { id: 'propertyType', label: 'Property Type', question: 'What type of property is it?', kind: 'choice', columns: 2, options: typeChoices },
      contactStep(undefined, { message: { label: 'Tell us about the project', optional: true } }),
    ],
  } satisfies LeadFormConfig,
};

/* -------------------------------------------------------------------------- */
/*  FIT OUT                                                                   */
/* -------------------------------------------------------------------------- */

export const fitOut = {
  hero: {
    eyebrow: 'Fit Out',
    heading: 'Turnkey Fit-Out, Handover to Move-In',
    intro:
      'From shell-and-core handover to a finished, rent-ready home: design, approvals and construction managed by one team.',
    // REAL – a DRP bathroom fit-out, from the current DRP Fit Out page
    image: '/media/2023/06/79E2A9DE-11AB-4413-9377-9FD50F843346-scaled.jpeg',
    imageAlt: 'A marble bathroom finished by the D|R|P fit-out team',
  },
  /** REAL – one completed DRP bathroom, from the current DRP site */
  gallery: [
    { src: '/media/2023/06/79E2A9DE-11AB-4413-9377-9FD50F843346-scaled.jpeg', alt: 'A D|R|P bathroom fit-out, photo 1' },
    { src: '/media/2023/06/C2891D1F-11A0-4C1C-A205-2460A194A674-scaled.jpeg', alt: 'A D|R|P bathroom fit-out, photo 2' },
    { src: '/media/2023/06/4916688E-4CDC-44CC-82C3-E78AE898C8F7-scaled.jpeg', alt: 'A D|R|P bathroom fit-out, photo 3' },
    { src: '/media/2023/06/8CEC8744-7500-4A04-B056-47C77699B5C2-scaled.jpeg', alt: 'A D|R|P bathroom fit-out, photo 4' },
    { src: '/media/2023/06/BEA1BE7A-DF42-4A27-A0EB-4AC3078D9795-scaled.jpeg', alt: 'A D|R|P bathroom fit-out, photo 5' },
    { src: '/media/2023/06/98AA7D81-C180-428D-953E-A1E0FCA2CB65-scaled.jpeg', alt: 'A D|R|P bathroom fit-out, photo 6' },
  ],
  intro: [
    'Many new villas and penthouses are handed over needing significant work before anyone can move in. Others need upgrading to compete in the rental market. Our fit-out team manages the whole process.',
    'We handle the drawings, the building and community approvals, the contractors and the snagging, and keep you updated with photos at every stage.',
  ],
  scope: [
    { title: 'Kitchens & bathrooms', text: 'Full replacement or upgrade, with fixtures sourced to specification.' },
    { title: 'Flooring & joinery', text: 'Stone, timber and bespoke built-in wardrobes and storage.' },
    { title: 'MEP', text: 'Mechanical, electrical and plumbing works by approved contractors.' },
    { title: 'Approvals', text: 'Drawings and permits with the developer, community and authorities.' },
    { title: 'Landscaping & pools', text: 'Gardens, terraces and pool works for villas.' },
    { title: 'Snagging', text: 'Independent inspection before and after works.' },
  ],
  steps: [
    { title: 'Survey', text: 'An on-site survey and a clear scope of works.' },
    { title: 'Design & approvals', text: 'Drawings, specification, quotation and permits.' },
    { title: 'Build', text: 'Works delivered by vetted contractors, with weekly photo updates.' },
    { title: 'Handover', text: 'Snagging, cleaning and handover, ready to furnish or let.' },
  ],
  faqs: [
    { q: 'How long does a fit-out take?', a: 'An apartment upgrade typically takes four to eight weeks; a full villa fit-out three to six months, depending on scope and approvals.' },
    { q: 'Do you handle building and community approvals?', a: 'Yes. We prepare drawings and manage approvals with the developer, the community and the relevant authorities.' },
    { q: 'Can I stay abroad during the works?', a: 'Yes. Most of our fit-out clients do. You receive weekly photo updates and approve key decisions remotely.' },
  ],
  form: {
    formId: 'fit-out',
    submitLabel: 'Request a Site Survey',
    successTitle: 'Thank you.',
    successBody: 'A D|R|P fit-out manager will contact you to arrange a site survey.',
    steps: [
      {
        id: 'scope',
        label: 'Scope',
        question: 'What does the property need?',
        kind: 'choice',
        columns: 2,
        options: [
          { value: 'Full fit-out', label: 'A full fit-out' },
          { value: 'Kitchen and bathrooms', label: 'Kitchen and bathrooms' },
          { value: 'Upgrade to let', label: 'An upgrade to let' },
          { value: 'Not sure yet', label: 'Not sure yet' },
        ],
      },
      { id: 'propertyType', label: 'Property Type', question: 'What type of property is it?', kind: 'choice', columns: 2, options: typeChoices },
      areaStep,
      contactStep(),
    ],
  } satisfies LeadFormConfig,
};
