/**
 * ============================================================================
 *  HEADER NAVIGATION — SINGLE SOURCE
 * ============================================================================
 *  The Header renders entirely from this file. Add, remove or reorder items
 *  here; no component changes are needed.
 *
 *  - `label`      full section title — the mobile accordion heading.
 *  - `shortLabel` condensed label for the desktop top row.
 *  - `href`       present on simple links; omitted on sections with a panel.
 *  - `columns`    turns the item into a mega-menu panel / mobile accordion.
 *                 Each column carries its own eyebrow title and links.
 *  - `promo`      optional right-hand feature card that fills the panel.
 *  - `hideOnHome` the Home link only appears once you have left "/".
 * ============================================================================
 */

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
  /** Renders permanently highlighted: orange, underlined, arrow always shown. */
  accent?: boolean;
};

export type NavColumn = {
  title: string;
  links: NavLink[];
};

export type NavPromo = {
  title: string;
  linkLabel: string;
  href: string;
  image: string;
  alt: string;
};

export type NavNode = {
  id: string;
  label: string;
  shortLabel?: string;
  href?: string;
  hideOnHome?: boolean;
  columns?: NavColumn[];
  promo?: NavPromo;
};

import { HOLIDAY_HOMES_URL } from './external';

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const areaLinks: NavLink[] = [
  { label: 'Explore All Areas', href: '/areas' },
  { label: 'Palm Jumeirah', href: '/areas/palm-jumeirah' },
  { label: 'Dubai Marina', href: '/areas/dubai-marina' },
  { label: 'Downtown Dubai', href: '/areas/downtown-dubai' },
  { label: 'Dubai Islands', href: '/areas/dubai-islands' },
  { label: 'Palm Jebel Ali', href: '/areas/palm-jebel-ali' },
];

export const navigation: NavNode[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    hideOnHome: true,
  },
  {
    id: 'ready',
    label: 'Buy & Rent',
    columns: [
      {
        title: 'Ready Properties',
        links: [
          { label: 'Buy Property', href: '/properties?offering=buy' },
          { label: 'Rent Property', href: '/properties?offering=rent' },
        ],
      },
      { title: 'Dubai Areas', links: areaLinks },
      {
        title: 'Guides & Finance',
        links: [
          { label: "Buyer's Guide", href: '/buying-guide' },
          { label: 'Golden Visa', href: '/golden-visa' },
          { label: 'Mortgage Assistance', href: '/ecosystem/mortgage' },
          { label: 'Property Calculators', href: '/calculators' },
          { label: 'Company Formation', href: '/ecosystem/company-formation' },
        ],
      },
    ],
    promo: {
      title: 'Palm Jebel Ali Villas',
      linkLabel: 'Explore the collection',
      href: '/areas/palm-jebel-ali',
      image: '/images/listyourproperty.webp',
      alt: 'A waterfront villa with a private pool at dusk',
    },
  },
  {
    id: 'sell',
    label: 'Sell',
    columns: [
      {
        title: 'Sell Your Property',
        links: [
          { label: 'List With D|R|P', href: '/list-your-property' },
          { label: 'Request a Property Valuation', href: '/property-valuation' },
          { label: "Seller's Guide", href: '/selling-guide' },
        ],
      },
      {
        title: 'Owner Services',
        links: [
          { label: 'Property Management', href: '/property-management' },
        ],
      },
    ],
    promo: {
      title: 'Free property valuation',
      linkLabel: 'Request yours',
      href: '/property-valuation',
      image: '/images/valuation.png',
      alt: 'A meeting room in the D|R|P office',
    },
  },
  {
    id: 'offplan',
    label: 'Off-Plan',
    columns: [
      {
        title: 'Our Projects',
        links: [
          { label: 'Latest Launches', href: '/off-plan/latest-launches' },
          { label: 'Investment Collections', href: '/off-plan/collections' },
          { label: 'Construction Tracker', href: '/off-plan/construction-tracker' },
          { label: 'All Off-Plan Projects', href: '/off-plan/projects' },
        ],
      },
      {
        title: 'Collections',
        links: [
          { label: 'Luxury Collection', href: '/off-plan/collections/luxury' },
          { label: 'Townhouses & Villas', href: '/off-plan/collections/townhouses-villas' },
          { label: 'Best ROI & Growth', href: '/off-plan/collections/roi-growth' },
          { label: 'Under AED 1.5M', href: '/off-plan/collections/under-aed-1-5m' },
        ],
      },
      {
        title: 'Developers',
        links: [{ label: 'Developer Network', href: '/off-plan/developers' }],
      },
    ],
    promo: {
      title: 'Q3 2026 Market Report',
      linkLabel: 'Download',
      href: '/market-report',
      image: '/images/market-report-q3-2026.webp',
      alt: 'The Dubai skyline at sunset from the Dubai Creek Harbour bridge',
    },
  },
  /* Holiday Homes is a separate DRP website — opens in a new tab */
  { id: 'holiday', label: 'Holiday Homes', href: HOLIDAY_HOMES_URL },
  {
    id: 'about',
    label: 'About',
    columns: [
      {
        title: 'About D|R|P',
        links: [
          { label: 'Our Story', href: '/about' },
          { label: 'Meet the Team', href: '/about#team' },
          { label: 'Careers', href: '/careers' },
        ],
      },
    ],
  },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

/**
 * Flat list shown in the full-screen overlay menu (desktop and mobile).
 * Separate from `navigation` so the overlay can list every page while the
 * desktop top row stays short.
 */
export const fullMenu: NavLink[] = [
  { label: 'Buy', href: '/properties?offering=buy' },
  { label: 'Rent', href: '/properties?offering=rent' },
  { label: 'Off-Plan', href: '/off-plan' },
  { label: 'Holiday Homes', href: HOLIDAY_HOMES_URL, external: true },
  { label: 'Property Management', href: '/property-management' },
  { label: 'D|R|P Furnishing', href: '/drp-furnishing' },
  { label: 'Car Fleet', href: '/ecosystem/car-fleet' },
  { label: 'About Us', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'News & Insights', href: '/news' },
  { label: 'D|R|P Magazine', href: '/magazine' },
  { label: 'D|R|P Ecosystem', href: '/ecosystem', accent: true },
  { label: 'Contact', href: '/contact' },
];

/**
 * Closing call to action. On the homepage it scrolls to the contact section;
 * everywhere else it goes to the contact page.
 */
export const navCta = {
  label: 'Speak With a Specialist',
  href: '/contact',
  homeHref: '#contact',
};
