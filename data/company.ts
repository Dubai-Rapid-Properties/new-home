/**
 * ============================================================================
 *  COMPANY — /about (incl. #team), /careers, /contact
 * ============================================================================
 *  Facts used as-is: established 2007, office on Golden Mile 9, Palm Jumeirah,
 *  and the About / Careers copy supplied by DRP.
 *
 *  The team comes from the current DRP website (see data/imported/).
 *
 *  DEMO PLACEHOLDERS – the careers hero photo, the ecosystem photography and
 *  the office hours.
 * ============================================================================
 */

import { drpPhoto, unsplash } from '@/lib/media';
import { HOLIDAY_HOMES_URL } from './external';
import { contact } from './homepage';
import importedTeam from './imported/team.json';
import portalTeam from './imported/portal-team.json';
import { toSlug } from '@/lib/slug';
import { brnFor } from './licences';

export const about = {
  hero: {
    eyebrow: 'About DRP',
    heading: 'Dubai Real Estate. One Team. Since 2007.',
    image: '/images/team.png',
    imageAlt: 'Inside the DRP office on Palm Jumeirah',
  },
  intro: [
    "Dubai Rapid Properties has been part of Dubai\u2019s real estate market since 2007. Over the years, we have grown from a real estate brokerage into a wider property ecosystem, supporting clients across property sales, rentals, off-plan investments, Holiday Homes and complementary services.",
    'Our approach remains personal: long-term relationships, local market knowledge and direct access to specialists who understand every stage of the property journey.',
  ],
  facts: [
    { id: 'year', value: '2007', label: 'Established in Dubai' },
    {
      id: 'home',
      value: 'Palm Jumeirah',
      label: 'Our home and headquarters',
      image: drpPhoto(2),
      imageAlt: 'The DRP office on the Golden Mile, Palm Jumeirah',
    },
    {
      id: 'ecosystem',
      value: ['Sales', 'Rentals', 'Off-Plan', 'Holiday Homes'],
      label: 'One property ecosystem',
    },
  ],
  ecosystem: {
    eyebrow: 'More Than a Brokerage',
    heading: 'One Team, Every Part of Property',
    // DEMO PLACEHOLDER – Unsplash photography; swap for DRP shoots
    services: [
      { name: 'Real Estate Brokerage', href: '/properties', image: '/images/property1.jpeg', alt: 'A villa on Palm Jumeirah' },
      { name: 'Off-Plan Investments', href: '/off-plan', image: '/images/listyourproperty.webp', alt: 'A new residential tower in Dubai' },
      { name: 'Holiday Homes', href: HOLIDAY_HOMES_URL, image: '/images/living1.jpeg', alt: 'A furnished holiday home living room' },
      { name: 'Car Fleet', href: '/ecosystem/car-fleet', image: '/images/car.jpeg', alt: 'A car outside a modern residence' },
      { name: 'Furnishing & Property Support', href: '/drp-furnishing', image: '/images/furnishing1.jpeg', alt: 'A styled living room' },
      { name: 'Partner Network', href: '/ecosystem/partner-network', image: unsplash('1521791136064-7986c2920216', 900), alt: 'Two people shaking hands' },
    ],
  },
  team: {
    eyebrow: 'Meet the People Behind DRP',
    heading: 'The Team',
  },
};

export type TeamMember = {
  id: string;
  /** URL slug for /about/team/[slug], from the name */
  slug: string;
  name: string;
  role: string;
  /** Short line under the role, drawn from the person's own bio. */
  line?: string;
  /** Full bio from the current DRP website */
  bio: string[];
  photo: string;
  /** Adds a WhatsApp shortcut to the main DRP number, addressed to this person. */
  whatsapp?: boolean;
  /** Adds an email shortcut to the DRP office inbox, addressed to this person. */
  email?: boolean;
  /** Other spellings used on Property Finder listings, e.g. "Adithya Mitter" */
  agentNames?: string[];
  /** RERA Broker Registration Number (data/licences.ts), shown on their profile */
  brn?: string;
  /** Their own numbers and email, from the portal; the DRP office's otherwise */
  phone?: string;
  whatsappNumber?: string;
  emailAddress?: string;
  /** False: only shown as the agent on their listings, no About card or profile */
  showOnAbout?: boolean;
};

/**
 * REAL – the team, names, roles, bios and office portraits from the current
 * DRP website (imported by `npm run import:drp`). Order and the short lines
 * are set here; the lines paraphrase each person's own bio.
 */
const teamOrder: {
  slug: string;
  line?: string;
  whatsapp?: boolean;
  email?: boolean;
  agentNames?: string[];
}[] = [
  { slug: 'darren-hayes', line: "Active in Dubai's real estate market since 2007.", email: true },
  { slug: '3107-2', line: 'Guiding buyers and sellers through every step, with a keen eye for detail.', whatsapp: true, email: true },
  { slug: '8342-2', line: "Matching buyers and investors to the right opportunities across Dubai's key communities.", whatsapp: true, agentNames: ['Adithya Mitter'] },
  { slug: 'neelt', line: "Investments matched to each client's lifestyle and financial goals.", whatsapp: true },
  { slug: 'dulshan-imantha', line: "Telling each property's story to the buyers and investors it suits.", email: true },
  { slug: 'anne-artisan', line: 'Keeping the office, agents and clients running smoothly.', email: true },
  { slug: 'delia-cuadrante' },
];

const builtInTeam: TeamMember[] = teamOrder.flatMap(({ slug, ...extra }) => {
  const person = importedTeam.find((t) => t.slug === slug);
  return person
    ? [{ id: slug, slug: toSlug(person.name), name: person.name, role: person.role, bio: person.bio, photo: person.photo, brn: brnFor(person.name), ...extra }]
    : [];
});

/** The team as staff keep it in the portal (Website → Team), synced at build time by scripts/sync-listings.mjs */
type PortalMember = {
  slug: string;
  name: string;
  role: string;
  line: string | null;
  bio: string[];
  photo: string | null;
  brn: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  agentNames: string[];
  showOnAbout: boolean;
};

const fromPortal: TeamMember[] = (portalTeam as PortalMember[]).map((m) => ({
  id: m.slug,
  slug: m.slug,
  name: m.name,
  role: m.role,
  line: m.line ?? undefined,
  bio: m.bio,
  photo: m.photo ?? '',
  brn: m.brn ?? brnFor(m.name),
  phone: m.phone ?? undefined,
  whatsappNumber: m.whatsapp ?? undefined,
  emailAddress: m.email ?? undefined,
  whatsapp: Boolean(m.whatsapp),
  email: Boolean(m.email),
  agentNames: m.agentNames,
  showOnAbout: m.showOnAbout,
}));

/** Everyone, including people shown only as listing agents. The portal's team once it has one. */
export const allTeam: TeamMember[] = fromPortal.length ? fromPortal : builtInTeam;

/** The About page and profile pages */
export const team: TeamMember[] = allTeam.filter((m) => m.showOnAbout !== false);

export const teamHref = (m: TeamMember) => `/about/team/${m.slug}`;
export const getTeamMember = (slug: string) => team.find((m) => m.slug === slug);
/** Whether the person has an About profile page to link to */
export const hasProfile = (m: TeamMember) => m.showOnAbout !== false;

/** The team member behind a listing's agent name (or one of their Property Finder spellings). */
export const teamMemberForAgent = (agent: string | null) =>
  agent ? allTeam.find((m) => m.name === agent || m.agentNames?.includes(agent)) : undefined;

const digits = (n: string) => n.replace(/[^\d]/g, '');

/**
 * How to reach someone: their own phone, WhatsApp and email from the portal,
 * each falling back to the DRP office's. `personal` says whether WhatsApp
 * reaches them directly.
 */
export function memberContact(m?: TeamMember) {
  const phone = m?.phone ?? contact.phone;
  const email = m?.emailAddress ?? contact.email;
  return {
    phone,
    phoneHref: `tel:+${digits(phone)}`,
    whatsappHref: `https://wa.me/${digits(m?.whatsappNumber ?? contact.whatsapp)}`,
    emailHref: `mailto:${email}`,
    personal: Boolean(m?.whatsappNumber && digits(m.whatsappNumber) !== digits(contact.whatsapp)),
  };
}

/**
 * REAL – "From the Management" on the current DRP About page, shown on the
 * founder's profile.
 */
export const managementMessage = {
  memberSlug: 'jasko-miletic',
  heading: 'From the Management',
  paragraphs: [
    'We are a company with big ambitions. We have achieved a lot in the last 19 years, but our sights are set much higher.',
    'We want our brand to become a byword for innovation. We will earn the trust of our customers by exceeding their expectations. We want to be known as a company that pushes the boundaries in all aspects of its business operations.',
  ],
  image: '/media/2026/09/Mr-Jasko-2-1-scaled.jpeg',
  imageAlt: 'Jasko Miletic, Founder & CEO of Dubai Rapid Properties',
};

export const careers = {
  hero: {
    eyebrow: 'Careers at DRP',
    heading: 'Build Your Real Estate Career with DRP',
    intro:
      'Dubai Rapid Properties has been operating in Dubai since 2007. We believe successful agents need more than a desk and a phone \u2014 they need market knowledge, guidance and the right environment to grow.',
    // Replace with the real DRP team group photos taken in front of the office
    image: unsplash('1522071820081-009f0129c71c', 2400),
    imageAlt: 'The DRP team together in the office',
  },
  starting: {
    eyebrow: 'Starting at DRP',
    heading: 'The DRP Academy',
    text: 'New agents receive hands-on support, particularly during their first months with the company. Through our internal DRP Academy, agents are introduced to the Dubai real estate market, communities, pricing, developers, sales processes and real situations they will encounter when working with buyers, sellers and investors.',
    pillars: [
      'Market & Area Training',
      'Pricing Knowledge',
      'Sales Guidance',
      'Developer & Project Knowledge',
      'Practical Case Training',
      'Ongoing Team Support',
    ],
  },
  join: {
    eyebrow: 'Want to Join DRP?',
    heading: 'Apply to the team',
    text: 'Whether you already have Dubai real estate experience or are looking to build your career in the market, we would like to hear from you.',
    submitLabel: 'Join the DRP Team',
    successTitle: 'Thank you for your interest.',
    successBody: 'Our team will review your application and get back to you.',
    experienceYears: ['Less than 1 year', '1 \u2013 3 years', '3 \u2013 5 years', '5 \u2013 10 years', '10+ years'],
    languages: [
      'English', 'Arabic', 'Russian', 'French', 'German', 'Italian', 'Spanish',
      'Hindi', 'Urdu', 'Persian', 'Mandarin', 'Tagalog', 'Other',
    ],
    cv: { maxBytes: 4 * 1024 * 1024, accept: '.pdf,.doc,.docx', extensions: ['pdf', 'doc', 'docx'] },
  },
};

export const contactPage = {
  hero: {
    eyebrow: 'Contact',
    heading: 'Get in Touch With DRP',
    intro: 'Call, WhatsApp, email or visit us on the Golden Mile. A DRP advisor will reply within one business day.',
    // REAL – the DRP team outside the office on Golden Mile 9
    image: '/images/drpteam.jpeg',
    imageAlt: 'The DRP team outside the office, under the D|R|P Dubai Rapid Properties sign',
    /* Tall, and below the header, so the sign and the whole team stay in frame */
    size: 'tall' as const,
    clearHeader: true,
  },
  // DEMO PLACEHOLDER – confirm office hours
  hours: [
    { days: 'Monday – Friday', time: '9:00 – 18:00' },
    { days: 'Saturday', time: '10:00 – 16:00' },
    { days: 'Sunday', time: 'By appointment' },
  ],
  mapEmbed: contact.mapEmbed,
  mapLink: contact.mapHref,
};
