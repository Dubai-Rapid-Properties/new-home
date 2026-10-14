/**
 * ============================================================================
 *  DRP ECOSYSTEM — /ecosystem, mortgage, company formation, partner network,
 *  owner portal
 * ============================================================================
 *  Fees and rates used by the mortgage calculator are indicative defaults and
 *  shown as estimates. DEMO PLACEHOLDERS – confirm with DRP's mortgage partners.
 * ============================================================================
 */

import { drpPhoto, unsplash } from '@/lib/media';
import { HOLIDAY_HOMES_URL } from './external';
import { contactStep, type LeadFormConfig } from './leadPages';

/* -------------------------------------------------------------------------- */
/*  OVERVIEW                                                                  */
/* -------------------------------------------------------------------------- */

export const ecosystem = {
  hero: {
    eyebrow: 'D|R|P Ecosystem',
    heading: 'Everything Around Your Property, Under One Roof',
    intro:
      'Buying, financing, furnishing, letting and looking after a home in Dubai — with one team that talks to itself.',
    image: unsplash('1580674684081-7617fbf3d745', 2000),
    imageAlt: 'The Dubai skyline seen across the city',
  },
  groups: [
    {
      title: 'Buy & Invest',
      services: [
        { name: 'Ready Properties', text: 'Homes to buy or rent now across Dubai.', href: '/properties' },
        { name: 'Off-Plan', text: 'New launches, payment plans and handover tracking.', href: '/off-plan' },
        { name: 'Mortgage Assistance', text: 'Pre-approval and rate comparison alongside your purchase.', href: '/ecosystem/mortgage' },
        { name: 'Company Formation', text: 'Buying through a company, set up for you.', href: '/ecosystem/company-formation' },
        { name: 'Partner Network', text: 'Vetted lenders, legal advisors and contractors.', href: '/ecosystem/partner-network' },
      ],
    },
    {
      title: 'Sell & Let',
      services: [
        { name: 'List Your Property', text: 'Sell or let with D|R|P.', href: '/list-your-property' },
        { name: 'Property Valuation', text: 'An evidence-based view of what it is worth.', href: '/property-valuation' },
        { name: 'Property Management', text: 'Letting, maintenance and reporting handled.', href: '/property-management' },
        { name: 'Holiday Homes', text: 'Short-stay management, on the D|R|P Holiday Homes site.', href: HOLIDAY_HOMES_URL },
      ],
    },
    {
      title: 'Prepare & Live',
      services: [
        { name: 'D|R|P Furnishing', text: 'Furnishing packages, interior design and styling.', href: '/drp-furnishing' },
        { name: 'Fit Out', text: 'From handover to a finished home.', href: '/fit-out' },
        { name: 'Car Fleet', text: 'Mobility for owners and guests.', href: '/ecosystem/car-fleet' },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  MORTGAGE                                                                  */
/* -------------------------------------------------------------------------- */

export const mortgage = {
  hero: {
    eyebrow: 'Mortgage Assistance',
    heading: 'Finance Your Dubai Property',
    intro:
      'Pre-approval, rate comparison across UAE lenders and the paperwork handled alongside your purchase — for residents and non-residents.',
    image: unsplash('1454165804606-c3d57bc86b40', 2000),
    imageAlt: 'Investors reviewing documents around a meeting table',
  },
  calculator: {
    defaultPrice: 2_500_000,
    defaultDownPct: 25,
    defaultRate: 4.49,
    defaultYears: 25,
    minDownPct: 20,
    /** Upfront cost assumptions shown as estimates */
    dldPct: 4,
    dldAdminAed: 580,
    mortgageRegPct: 0.25,
    mortgageRegAdminAed: 290,
    agencyPct: 2,
    vatPct: 5,
    valuationAed: 3_000,
  },
  steps: [
    { title: 'Pre-approval', text: 'We compare lenders and secure an approval in principle before you commit.' },
    { title: 'Valuation', text: 'The bank values the property; we coordinate access and documents.' },
    { title: 'Final offer', text: 'Your lender issues the final offer letter and mortgage contract.' },
    { title: 'Transfer', text: 'We manage the transfer at the Land Department with the bank and seller.' },
  ],
  faqs: [
    { q: 'Can non-residents get a mortgage in Dubai?', a: 'Yes. Several UAE banks lend to non-residents, usually with a larger down payment than residents. We will match you with lenders that suit your situation.' },
    { q: 'How much deposit do I need?', a: 'Typically at least 20% of the price for residents buying their first home, and more for non-residents, higher-value or off-plan purchases. Lender policies vary.' },
    { q: 'What other costs should I budget for?', a: 'The Dubai Land Department transfer fee, mortgage registration, valuation and agency fees. The calculator above estimates these for you.' },
    { q: 'Does D|R|P charge for mortgage assistance?', a: 'Our mortgage partners are paid by the lender in most cases.' }, // DEMO PLACEHOLDER — confirm the arrangement
  ],
  form: {
    formId: 'mortgage',
    submitLabel: 'Get Pre-Approved',
    successTitle: 'Thank you.',
    successBody: 'A D|R|P mortgage specialist will contact you to start your pre-approval.',
    steps: [
      {
        id: 'residency',
        label: 'Residency',
        question: 'Are you a UAE resident?',
        kind: 'choice',
        columns: 2,
        options: [
          { value: 'Resident', label: 'Yes, UAE resident' },
          { value: 'Non-resident', label: 'No, non-resident' },
        ],
      },
      {
        id: 'stage',
        label: 'Stage',
        question: 'Where are you in your purchase?',
        kind: 'choice',
        columns: 3,
        options: [
          { value: 'Researching', label: 'Researching' },
          { value: 'Viewing', label: 'Viewing properties' },
          { value: 'Offer made', label: 'Offer made' },
        ],
      },
      contactStep(),
    ],
  } satisfies LeadFormConfig,
};

/* -------------------------------------------------------------------------- */
/*  COMPANY FORMATION                                                         */
/* -------------------------------------------------------------------------- */

export const companyFormation = {
  hero: {
    eyebrow: 'Company Formation',
    heading: 'Buying Through a Company',
    intro:
      'Free-zone, offshore and mainland structures for investors who hold Dubai property through a company — set up alongside your purchase.',
    // REAL – DRP's office on Golden Mile 9, Palm Jumeirah, at night
    image: '/images/office-front.webp',
    imageAlt: 'The D|R|P office front at night, with the illuminated D|R|P Dubai Rapid Properties sign',
    /* The sign sits in the top third of the photo; keep it clear of the header */
    imagePosition: '50% 8%',
  },
  intro: [
    'Many investors choose to own Dubai property through a company: for succession planning, to hold several properties together, or to bring in partners.',
    'Not every structure can own property in every area, so the right choice depends on what and where you are buying. We work with licensed corporate service partners to set it up before transfer.',
  ],
  structures: [
    { title: 'Offshore company', text: 'Commonly used to hold freehold property, with confidentiality and straightforward succession.' },
    { title: 'Free-zone company', text: 'A UAE licence with 100% foreign ownership, suited to investors who also trade in the UAE.' },
    { title: 'Mainland company', text: 'For investors operating a business in Dubai that also holds property.' },
  ],
  steps: [
    { title: 'Consultation', text: 'We discuss what you are buying, why, and who the shareholders will be.' },
    { title: 'Structure', text: 'Our partners recommend the right jurisdiction and prepare the documents.' },
    { title: 'Registration', text: 'Company incorporation, registered agent and bank account support.' },
    { title: 'Transfer', text: 'The property transfers into the company name at the Land Department.' },
  ],
  documents: [
    'Passport copies for each shareholder and director',
    'Proof of address',
    'Bank reference letter',
    'Brief CV or business profile',
    'Details of the property being purchased',
  ],
  faqs: [
    { q: 'Can any company own property in Dubai?', a: 'No. Only certain approved structures can hold freehold property, and some developers or areas have their own rules. Our partners confirm eligibility before you incorporate.' },
    { q: 'How long does it take?', a: 'Typically two to four weeks, depending on the jurisdiction and how quickly documents are provided.' },
    { q: 'Can I move a property I already own into a company?', a: 'Often yes, though a transfer fee may apply. We will set out the costs before you decide.' },
  ],
  form: {
    formId: 'company-formation',
    submitLabel: 'Book a Consultation',
    successTitle: 'Thank you.',
    successBody: 'A D|R|P specialist will contact you to discuss the right structure.',
    steps: [
      {
        id: 'reason',
        label: 'Reason',
        question: 'Why are you considering a company?',
        kind: 'choice',
        columns: 2,
        options: [
          { value: 'Succession', label: 'Succession planning' },
          { value: 'Several properties', label: 'Holding several properties' },
          { value: 'Partners', label: 'Buying with partners' },
          { value: 'Not sure', label: 'Not sure yet' },
        ],
      },
      contactStep(undefined, { message: { label: 'Anything we should know', optional: true } }),
    ],
  } satisfies LeadFormConfig,
};

/* -------------------------------------------------------------------------- */
/*  PARTNER NETWORK                                                           */
/* -------------------------------------------------------------------------- */

export const partnerNetwork = {
  hero: {
    eyebrow: 'Partner Network',
    heading: 'The Partners Behind Every Transaction',
    intro:
      'Vetted developers, lenders, legal advisors, contractors and suppliers — so every part of owning property in Dubai is handled by someone we trust.',
    image: unsplash('1521791136064-7986c2920216', 2000),
    imageAlt: 'Two people shaking hands after completing a property transaction',
  },
  categories: [
    { title: 'Developers', text: 'Direct relationships with Dubai’s leading master developers for launches and allocations.' },
    { title: 'Mortgage partners', text: 'Brokers and banks lending to residents and non-residents.' },
    { title: 'Legal & conveyancing', text: 'Law firms and conveyancers for transfers, wills and structures.' },
    { title: 'Corporate services', text: 'Licensed partners for company formation and Golden Visa support.' },
    { title: 'Contractors', text: 'Fit-out, maintenance and MEP contractors with D|R|P’s quality standards.' },
    { title: 'Interiors suppliers', text: 'Furniture, lighting and soft-furnishing suppliers for D|R|P Interiors.' },
  ],
  form: {
    formId: 'partner-network',
    submitLabel: 'Apply to Partner',
    successTitle: 'Thank you.',
    successBody: 'Our partnerships team will review your details and be in touch.',
    steps: [
      {
        id: 'category',
        label: 'Category',
        question: 'What kind of partner are you?',
        kind: 'choice',
        columns: 2,
        options: [
          'Developer',
          'Mortgage partner',
          'Legal & conveyancing',
          'Corporate services',
          'Contractor',
          'Interiors supplier',
        ].map((v) => ({ value: v, label: v })),
      },
      contactStep(undefined, {
        question: 'Tell us about your company',
        message: { label: 'Company name, website and what you offer' },
      }),
    ],
  } satisfies LeadFormConfig,
};

/* -------------------------------------------------------------------------- */
/*  OWNER PORTAL                                                              */
/* -------------------------------------------------------------------------- */

export const ownerPortal = {
  features: [
    { title: 'Statements', text: 'Monthly owner statements and annual summaries to download.' },
    { title: 'Bookings & occupancy', text: 'Holiday-home calendar, bookings and nightly rates.' },
    { title: 'Tenancy', text: 'Contracts, Ejari, cheque schedule and renewal dates.' },
    { title: 'Maintenance', text: 'Raise requests, approve quotes and see work completed.' },
    { title: 'Documents', text: 'Title deeds, DEWA, service charges and licences in one place.' },
    { title: 'Messages', text: 'Direct line to your D|R|P account manager.' },
  ],
};
