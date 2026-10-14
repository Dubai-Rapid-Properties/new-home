/**
 * ============================================================================
 *  GUIDES — /buying-guide, /selling-guide and /golden-visa
 * ============================================================================
 *  General guidance on the Dubai process. Rules and fees change; every page
 *  asks visitors to confirm the details for their own case with DRP.
 * ============================================================================
 */

import type { Faq } from '@/components/sections/FaqList';
import type { Feature } from '@/components/sections/FeatureGrid';
import type { Step } from '@/components/sections/ProcessSteps';

export type Guide = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; heading: string; intro: string; image: string; imageAlt: string };
  intro: { eyebrow: string; heading: string; paragraphs: string[] };
  steps: { eyebrow: string; heading: string; intro?: string; items: Step[] };
  extra?: { eyebrow: string; heading: string; intro?: string; items: Feature[] };
  faqs: Faq[];
  cta: { eyebrow: string; heading: string; text: string; button: { label: string; href: string }; whatsappText: string };
  related: { label: string; href: string }[];
};

export const buyingGuide: Guide = {
  meta: {
    title: "Buying Property in Dubai: A Buyer's Guide | Dubai Rapid Properties",
    description: 'How buying a home in Dubai works, step by step: budget, viewings, the MOU, NOC and transfer at the Land Department, and the costs on top of the price.',
  },
  hero: {
    eyebrow: "Buyer's Guide",
    heading: 'Buying Property in Dubai',
    intro: 'From the first viewing to the title deed, the steps of a Dubai purchase and what each one costs.',
    image: '/images/buy.jpeg',
    imageAlt: 'A furnished living room with a view over Dubai',
  },
  intro: {
    eyebrow: 'Before You Start',
    heading: 'Open to buyers from anywhere',
    paragraphs: [
      'Foreign buyers can own property outright in Dubai’s freehold areas, including Palm Jumeirah, Dubai Marina, Downtown and Dubai Hills. You do not need to be a UAE resident, and a purchase of AED 2 million or more can qualify you for a 10-year Golden Visa.',
      'Every sale is registered with the Dubai Land Department (DLD), which keeps the process transparent: the deposit is held against a standard contract, and ownership passes at a DLD trustee office on the day of transfer.',
    ],
  },
  steps: {
    eyebrow: 'Ready Property',
    heading: 'Six Steps to the Keys',
    items: [
      { title: 'Set your budget', text: 'Allow around 6% on top of the price for fees (4% DLD + 2% agency). Buying with a mortgage, get a pre-approval first so you know exactly what you can offer.' },
      { title: 'View and shortlist', text: 'Your D|R|P specialist arranges viewings in person or by video, and checks each building’s service charges, history and rental potential.' },
      { title: 'Agree the price', text: 'We negotiate on your behalf and confirm the terms: price, transfer date, what stays in the home and how vacant possession is handled.' },
      { title: 'Sign the MOU', text: 'Buyer and seller sign the RERA Memorandum of Understanding (Form F). The buyer gives a security deposit, usually 10% of the price, held until transfer.' },
      { title: 'NOC from the developer', text: 'The seller obtains a No Objection Certificate confirming the service charges are paid. Mortgage buyers complete the bank’s valuation and final offer.' },
      { title: 'Transfer and title deed', text: 'At the DLD trustee office the balance and fees are paid, the title deed is issued in your name, and the keys are handed over.' },
    ],
  },
  extra: {
    eyebrow: 'Buying Off-Plan',
    heading: 'Buying from the developer',
    intro: 'Off-plan purchases follow the developer’s process instead of the resale steps.',
    items: [
      { title: 'Reserve the unit', text: 'A booking amount secures the unit while the Sales and Purchase Agreement is prepared.' },
      { title: 'Sign the SPA', text: 'The agreement sets the price, payment plan and handover date. The sale is registered with the DLD (Oqood).' },
      { title: 'Pay to the plan', text: 'Instalments go into a DLD-regulated escrow account and are tied to construction progress or set dates.' },
      { title: 'Handover', text: 'On completion you inspect the home (snagging), pay any balance, and receive the title deed and keys.' },
    ],
  },
  faqs: [
    { q: 'What does it cost to buy on top of the price?', a: 'The main cost is the 4% DLD transfer fee. A resale purchase adds the trustee office fee and usually a 2% agency fee plus VAT; a mortgage adds registration, valuation and bank fees. Altogether, plan for about 6% (4% + 2%) for a resale purchase.' },
    { q: 'Can I buy without being in Dubai?', a: 'Yes. Documents can be signed remotely or through a power of attorney, and D|R|P can attend the transfer on your behalf.' },
    { q: 'Can non-residents get a mortgage?', a: 'Yes. Non-residents can typically borrow up to 50–60% of the value, residents up to 80% on a first home under AED 5 million. Our mortgage team compares UAE lenders for you.' },
    { q: 'How long does a purchase take?', a: 'A cash resale typically completes in two to four weeks from the MOU; with a mortgage, allow four to eight weeks.' },
  ],
  cta: {
    eyebrow: 'Start Your Search',
    heading: 'Buy with a D|R|P specialist',
    text: 'Tell us what you are looking for and we will shortlist homes, arrange viewings and take you through to the title deed.',
    button: { label: 'Speak With a Specialist', href: '/contact' },
    whatsappText: 'Hello D|R|P, I am looking to buy a property in Dubai.',
  },
  related: [
    { label: 'Properties for sale', href: '/properties?offering=buy' },
    { label: 'Buying costs calculator', href: '/calculators#buying-costs' },
    { label: 'Mortgage assistance', href: '/ecosystem/mortgage' },
    { label: 'Golden Visa', href: '/golden-visa' },
  ],
};

export const sellingGuide: Guide = {
  meta: {
    title: "Selling Property in Dubai: A Seller's Guide | Dubai Rapid Properties",
    description: 'How selling a home in Dubai works: valuation, the listing agreement, marketing permit, MOU, developer NOC, mortgage clearance and transfer.',
  },
  hero: {
    eyebrow: "Seller's Guide",
    heading: 'Selling Property in Dubai',
    intro: 'How a Dubai sale works, from the valuation to the day ownership passes to the buyer.',
    image: '/images/listyourproperty.webp',
    imageAlt: 'A waterfront villa with a private pool at dusk',
  },
  intro: {
    eyebrow: 'Before You List',
    heading: 'Price it right from day one',
    paragraphs: [
      'The first two weeks on the market bring the most interest, so the asking price matters most at the start. A D|R|P valuation compares recent DLD transactions in your building or community with what is listed now.',
      'Before marketing begins, the sale needs a signed listing agreement and a DLD advertising permit, which D|R|P arranges for you.',
    ],
  },
  steps: {
    eyebrow: 'The Process',
    heading: 'Seven Steps to Transfer',
    items: [
      { title: 'Valuation', text: 'We value the home against recent transactions and current competition, and agree the asking price with you.' },
      { title: 'Listing agreement', text: 'You sign the RERA listing agreement (Form A) with D|R|P, with a copy of the title deed and your passport.' },
      { title: 'Permit and marketing', text: 'D|R|P obtains the DLD advertising permit, photographs the home and markets it on our website, the portals and to our buyers.' },
      { title: 'Offer and MOU', text: 'We negotiate the best offer and you sign the MOU (Form F) with the buyer, who gives a security deposit.' },
      { title: 'Developer NOC', text: 'You clear any outstanding service charges and apply for the developer’s No Objection Certificate.' },
      { title: 'Mortgage clearance', text: 'If the home is mortgaged, your bank issues a liability letter; the outstanding loan is settled at or before transfer.' },
      { title: 'Transfer', text: 'At the DLD trustee office the buyer pays, ownership passes, and you receive the sale proceeds.' },
    ],
  },
  faqs: [
    { q: 'What does it cost to sell?', a: 'Sellers usually pay the agency fee, commonly 2% plus VAT, and the developer’s NOC fee. A mortgaged home may also carry an early settlement fee from the bank.' },
    { q: 'Can I sell a property that is still mortgaged?', a: 'Yes. The outstanding balance is settled from the buyer’s payment at transfer, or the buyer’s bank buys out the loan. We coordinate the banks for you.' },
    { q: 'Can I sell an off-plan property before handover?', a: 'Often, yes. Many developers allow an assignment once a set share of the price is paid. The developer’s rules and fees apply.' },
    { q: 'Is there tax on the sale?', a: 'There is no capital gains tax for individuals in Dubai. Check your obligations in your home country.' },
  ],
  cta: {
    eyebrow: 'Free Valuation',
    heading: 'What is your home worth?',
    text: 'Request a valuation and a D|R|P specialist will come back with a price based on real transactions.',
    button: { label: 'Request a Valuation', href: '/property-valuation' },
    whatsappText: 'Hello D|R|P, I would like to sell my property in Dubai.',
  },
  related: [
    { label: 'List your property with D|R|P', href: '/list-your-property' },
    { label: 'Request a valuation', href: '/property-valuation' },
    { label: 'Property management', href: '/property-management' },
  ],
};

export const goldenVisa: Guide = {
  meta: {
    title: 'UAE Golden Visa Through Property Investment | Dubai Rapid Properties',
    description: 'How a Dubai property purchase of AED 2 million or more can qualify you and your family for the 10-year UAE Golden Visa.',
  },
  hero: {
    eyebrow: 'Golden Visa',
    heading: 'Residency Through Property',
    intro: 'A Dubai property worth AED 2 million or more can bring a 10-year UAE Golden Visa for you and your family.',
    image: '/images/palmjumeirah.webp',
    imageAlt: 'Palm Jumeirah at sunset',
  },
  intro: {
    eyebrow: 'The 10-Year Visa',
    heading: 'Long-term residency, renewable',
    paragraphs: [
      'The UAE Golden Visa is a 10-year, renewable residence visa. Property investors qualify by owning real estate in Dubai with a total value of at least AED 2 million — in one property or several.',
      'Unlike a standard residence visa, it needs no employer or sponsor, and the holder can spend long periods outside the UAE without the visa lapsing.',
    ],
  },
  steps: {
    eyebrow: 'How It Works',
    heading: 'From Purchase to Visa',
    items: [
      { title: 'Choose the property', text: 'Ready or off-plan from an approved developer, worth AED 2 million or more in total.' },
      { title: 'Complete the purchase', text: 'Register the property with the Dubai Land Department. A mortgaged home can qualify with the bank’s consent.' },
      { title: 'Apply', text: 'The application goes through the Land Department and residency authorities with your title deed, passport and photos.' },
      { title: 'Medical and Emirates ID', text: 'A medical check and biometrics complete the process, and the visa and Emirates ID are issued.' },
    ],
  },
  extra: {
    eyebrow: 'What It Gives You',
    heading: 'The benefits',
    items: [
      { title: '10 years, renewable', text: 'Renew for as long as you keep the qualifying property.' },
      { title: 'Your family', text: 'Sponsor your spouse and children, and domestic staff.' },
      { title: 'No sponsor needed', text: 'Your residency does not depend on an employer.' },
      { title: 'Time abroad', text: 'Stays outside the UAE of more than six months do not cancel the visa.' },
    ],
  },
  faqs: [
    { q: 'Does an off-plan property qualify?', a: 'Off-plan properties from developers approved by the Dubai Land Department can qualify. Your D|R|P specialist confirms the status of a specific project.' },
    { q: 'Can I combine several properties?', a: 'Yes. The AED 2 million can be reached across more than one property you own.' },
    { q: 'What if the property is mortgaged?', a: 'A mortgaged property can qualify with a no-objection letter from the bank. The rules on how much must be paid change from time to time, so we confirm them for your case.' },
    { q: 'Is there an option below AED 2 million?', a: 'Shorter residence visas have been available to property owners at lower values. Ask us about the current options for your budget.' },
  ],
  cta: {
    eyebrow: 'Golden Visa Properties',
    heading: 'Find a qualifying property',
    text: 'We will shortlist homes and off-plan projects that meet the Golden Visa threshold, and guide you through the application.',
    button: { label: 'Speak With a Specialist', href: '/contact' },
    whatsappText: 'Hello D|R|P, I am interested in a Golden Visa through property investment.',
  },
  related: [
    { label: 'Properties for sale', href: '/properties?offering=buy&min=2000000' },
    { label: 'Off-plan projects', href: '/off-plan/projects?min=2000000' },
    { label: "Buyer's guide", href: '/buying-guide' },
  ],
};
