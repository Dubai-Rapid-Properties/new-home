import { contactPage } from '@/data/company';
import { contact, footer, licences, site } from '@/data/homepage';
import { formatPrice, listingHref, type Listing } from '@/data/properties';
import { siteUrl } from './siteUrl';

const absolute = (path: string) => (path.startsWith('http') ? path : `${siteUrl}${path}`);

/** DRP as a real estate agent: name, office, contacts and social profiles. */
export const organisation = () => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  '@id': `${siteUrl}/#organisation`,
  name: site.name,
  alternateName: site.shortName,
  url: siteUrl,
  logo: absolute(site.logos.black),
  image: absolute('/opengraph-image.jpg'),
  description: site.tagline,
  foundingDate: String(site.established),
  telephone: contact.phone,
  email: contact.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: contact.addressLine,
    addressLocality: 'Dubai',
    addressCountry: 'AE',
  },
  openingHoursSpecification: contactPage.hours.flatMap((h) =>
    'open' in h && h.open
      ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: h.open.days, opens: h.open.opens, closes: h.open.closes }]
      : [],
  ),
  areaServed: 'Dubai',
  sameAs: footer.socials.map((s) => s.href),
  ...(licences.orn ? { identifier: { '@type': 'PropertyValue', name: 'RERA ORN', value: licences.orn } } : {}),
});

/** One listing as an offer for sale or rent. */
export const listingData = (l: Listing) => {
  const url = absolute(listingHref(l.slug));
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    url,
    name: l.title,
    description: l.description.join(' ').slice(0, 500),
    image: l.images.slice(0, 6).map((i) => absolute(i.src)),
    datePosted: l.listedAt,
    offers: {
      '@type': 'Offer',
      price: l.price,
      priceCurrency: 'AED',
      description: formatPrice(l) + (l.offering === 'rent' ? ' per year' : ''),
      businessFunction: l.offering === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${siteUrl}/#organisation` },
    },
    about: {
      '@type': l.type === 'Apartment' || l.type === 'Penthouse' ? 'Apartment' : 'SingleFamilyResidence',
      numberOfBedrooms: l.beds,
      numberOfBathroomsTotal: l.baths,
      floorSize: { '@type': 'QuantitativeValue', value: l.size, unitCode: 'FTK' },
      address: {
        '@type': 'PostalAddress',
        addressLocality: l.area,
        addressRegion: 'Dubai',
        addressCountry: 'AE',
      },
    },
  };
};

/** The site itself, so search engines show "Dubai Rapid Properties" as the site name. */
export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: site.name,
  alternateName: [site.shortName, 'DRP'],
  url: siteUrl,
  publisher: { '@id': `${siteUrl}/#organisation` },
  inLanguage: 'en-AE',
});

/** The trail from the home page to this page, as search results show it. */
export const breadcrumbData = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: absolute(t.path),
  })),
});

/** A page's questions and answers. */
export const faqData = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/** An off-plan project as a place: the development, its photos and where it is (Place has no price or builder). */
export const projectData = (p: {
  name: string;
  slug: string;
  developer: string | null;
  area: string;
  description: string[];
  image: string;
  gallery: { src: string }[];
  map: { near?: [number, number] };
}) => {
  const url = absolute(`/off-plan/${p.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    '@id': url,
    url,
    name: p.name,
    description: p.description.join(' ').slice(0, 500),
    image: [p.image, ...p.gallery.map((g) => g.src)].slice(0, 6).map(absolute),
    address: { '@type': 'PostalAddress', addressLocality: p.area, addressRegion: 'Dubai', addressCountry: 'AE' },
    ...(p.map.near ? { geo: { '@type': 'GeoCoordinates', latitude: p.map.near[0], longitude: p.map.near[1] } } : {}),
  };
};
