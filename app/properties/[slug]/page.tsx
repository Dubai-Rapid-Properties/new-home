import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import SiteShell from '@/components/layout/SiteShell';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import PropertyCard from '@/components/PropertyCard';
import FavouriteButton from '@/components/properties/FavouriteButton';
import ListingGallery from '@/components/properties/ListingGallery';
import ShareLinks from '@/components/news/ShareLinks';
import PropertyMap from '@/components/properties/PropertyMap';
import PermitCheck from '@/components/properties/PermitCheck';
import AgentCard from '@/components/properties/AgentCard';
import ListingContact, { VIEWING_HASH } from '@/components/properties/ListingContact';
import RecentSales from '@/components/market/RecentSales';
import { ListingMortgage } from '@/components/ecosystem/MortgageCalculator';
import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import CurrencySwitch from '@/components/ui/CurrencySwitch';
import Price from '@/components/ui/Price';
import SmartLink from '@/components/ui/SmartLink';
import { contactStep, type LeadFormConfig } from '@/data/leadPages';
import {
  bedsLong,
  formatPrice,
  getListing,
  listingLocation,
  similarListings,
  toPropertyCard,
} from '@/data/properties';
import { areaHref, areas } from '@/data/areas';
import { teamHref, teamMemberForAgent } from '@/data/company';
import { brnFor } from '@/data/licences';
import { listingData } from '@/lib/structuredData';
import { staticSlugs } from './slugs';

/** Next 16: route params arrive as a Promise and must be awaited. */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const listing = getListing((await params).slug);
  return { title: listing ? `${listing.title} | Dubai Rapid Properties` : 'Property | Dubai Rapid Properties' };
}

const enquiryForm: LeadFormConfig = {
  formId: 'property-enquiry',
  submitLabel: 'Send Enquiry',
  successTitle: 'Thank you.',
  successBody: 'A DRP specialist will contact you shortly about this property.',
  steps: [
    contactStep(
      { id: 'viewing', label: 'I would like to arrange a viewing' },
      {
        question: 'Enquire about this property',
        helper: 'The specialist handling this listing will reply personally.',
        message: { label: 'Message', optional: true },
      },
    ),
  ],
};

export default async function Page({ params }: PageProps) {
  const listing = getListing((await params).slug);
  if (!listing) notFound();

  const isRent = listing.offering === 'rent';
  const backHref = `/properties?offering=${listing.offering}`;
  const facts = [
    ['Bedrooms', bedsLong(listing.beds)],
    ['Bathrooms', String(listing.baths)],
    ['Size', `${listing.size.toLocaleString('en-US')} sq ft`],
    ['Type', listing.type],
    ['Status', listing.completion],
    ...(listing.furnishing ? [['Furnishing', listing.furnishing]] : []),
  ];
  /* Only link areas that have a guide */
  const guide = areas.find((a) => a.name === listing.area);
  const location = listingLocation(listing);
  const agent = teamMemberForAgent(listing.agent);
  const similar = similarListings(listing);

  return (
    <SiteShell>
      <JsonLd data={listingData(listing)} />
      <section className="bg-white pb-[var(--section-y)] pt-24 lg:pt-28">
        <div className="container-drp">
          <nav aria-label="Breadcrumb" className="py-5 text-[11px] uppercase tracking-eyebrow text-charcoal-muted sm:py-6">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <SmartLink href="/properties" className="hover:text-orange">Properties</SmartLink>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <SmartLink href={backHref} className="hover:text-orange">
                  {isRent ? 'For Rent' : 'For Sale'}
                </SmartLink>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-charcoal">{listing.area}</li>
            </ol>
          </nav>

          <ListingGallery images={listing.images} title={listing.title} />

          <div className="mt-10 grid grid-cols-1 gap-14 sm:mt-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="eyebrow text-orange">
                {isRent ? 'For Rent' : 'For Sale'}
                {listing.completion === 'Off-Plan' ? ' · Off-Plan' : ''}
              </p>
              <h1 className="heading-display mt-4 text-[clamp(2rem,4vw,3.25rem)] text-charcoal">
                {listing.title}
              </h1>
              <p className="mt-4 text-sm font-light text-charcoal-muted">
                {location.label === listing.building ? (
                  listing.building
                ) : (
                  <>
                    {listing.building ? `${listing.building}, ` : ''}
                    {guide ? (
                      <SmartLink href={areaHref(guide.name)} className="underline-offset-4 hover:text-orange hover:underline">
                        {listing.area}
                      </SmartLink>
                    ) : (
                      listing.area
                    )}
                  </>
                )}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <p className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-charcoal">
                  <Price aed={listing.price} />
                  {isRent ? (
                    <span className="ml-2 font-sans text-sm font-light text-charcoal-muted">/ year</span>
                  ) : null}
                </p>
                <CurrencySwitch />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={VIEWING_HASH}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-orange bg-orange px-4 text-[12px] text-white transition-colors duration-300 hover:bg-orange-600"
                >
                  <CalendarDays aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
                  Book a viewing
                </a>
                <FavouriteButton slug={listing.slug} title={listing.title} variant="inline" />
                <ShareLinks title={`${listing.title} — ${formatPrice(listing)}`} />
              </div>

              <dl className="mt-10 grid grid-cols-2 border-t border-line sm:grid-cols-3">
                {facts.map(([label, value]) => (
                  <div key={label} className="border-b border-line py-5 pr-4">
                    <dt className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{label}</dt>
                    <dd className="mt-2 text-[15px] font-light text-charcoal">{value}</dd>
                  </div>
                ))}
              </dl>
              {listing.permit ? <PermitCheck permit={listing.permit} permitUrl={listing.permitUrl} /> : null}

              <h2 className="mt-14 font-serif text-[1.75rem] font-light text-charcoal">About this property</h2>
              <div className="mt-5 space-y-5">
                {listing.description.map((p, i) => (
                  <p key={i} className="text-[15px] font-light leading-relaxed text-charcoal-light sm:text-base">
                    {p}
                  </p>
                ))}
              </div>

              {listing.features.length ? (
                <>
                  <h2 className="mt-14 font-serif text-[1.75rem] font-light text-charcoal">Features</h2>
                  <ul className="mt-5 grid grid-cols-1 border-t border-line sm:grid-cols-2 sm:gap-x-10">
                    {listing.features.map((f) => (
                      <li key={f} className="flex items-baseline gap-4 border-b border-line py-4 text-[15px] font-light text-charcoal">
                        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 -translate-y-0.5 rounded-full bg-orange" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {isRent ? null : (
                <section aria-labelledby="mortgage-heading" className="mt-14">
                  <ListingMortgage price={listing.price} headingId="mortgage-heading" />
                </section>
              )}

              <section aria-labelledby="location-heading" className="mt-14">
                <PropertyMap {...location} headingId="location-heading" />
              </section>

              <RecentSales listing={listing} headingId="sales-heading" />

              {listing.agent ? (
                <p className="mt-12 text-sm font-light text-charcoal-muted">
                  Listed by{' '}
                  {agent ? (
                    <SmartLink href={teamHref(agent)} className="text-charcoal underline-offset-4 hover:text-orange hover:underline">
                      {agent.name}
                    </SmartLink>
                  ) : (
                    <span className="text-charcoal">{listing.agent}</span>
                  )}
                  {brnFor(listing.agent) ? ` (BRN ${brnFor(listing.agent)})` : ''} · Ref. {listing.ref}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {guide ? <ArrowLink href={areaHref(guide.name)} label={`${guide.name} area guide`} /> : null}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                {listing.agent ? (
                  <AgentCard agent={listing.agent} listingTitle={listing.title} listingSlug={listing.slug} />
                ) : null}
                <ListingContact
                  context={{ listingRef: listing.ref, listingTitle: listing.title, lookingTo: isRent ? 'Rent' : 'Buy' }}
                  enquiry={
                    <LeadForm
                      config={enquiryForm}
                      context={{ listingRef: listing.ref, listingTitle: listing.title }}
                      density="compact"
                      className="lg:!px-10 lg:!py-10"
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {similar.length ? (
        <section aria-labelledby="similar-heading" className="section-y bg-cream">
          <div className="container-drp">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading eyebrow="You may also like" heading="Similar Properties" headingId="similar-heading" />
              <ArrowLink href={backHref} label={`All properties ${isRent ? 'for rent' : 'for sale'}`} />
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {similar.map((l, i) => (
                <Reveal as="li" key={l.slug} delay={i * 0.08}>
                  <PropertyCard {...toPropertyCard(l)} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
