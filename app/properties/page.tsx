import SiteShell from '@/components/layout/SiteShell';
import PageHero from '@/components/PageHero';
import PropertyAlerts from '@/components/properties/PropertyAlerts';
import PropertyExplorer from '@/components/properties/PropertyExplorer';
import RecentlyViewed from '@/components/properties/RecentlyViewed';
import { listings, toPropertyCard } from '@/data/properties';
import CtaBand from '@/components/sections/CtaBand';
import CurrencySwitch from '@/components/ui/CurrencySwitch';
import SectionHeading from '@/components/ui/SectionHeading';
import { unsplash } from '@/lib/media';

export const metadata = { title: 'Properties for Sale and Rent in Dubai | Dubai Rapid Properties' };

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Ready Properties"
        heading="Properties for Sale and Rent"
        intro="Apartments, villas, townhouses and penthouses available now across Dubai, each one personally viewed by a DRP specialist."
        // DEMO PLACEHOLDER – swap for DRP photography
        image={'/images/buy.jpeg'}
        imageAlt="A furnished sea-view living room on Palm Jumeirah"
      />
      <section aria-labelledby="listings-heading" className="bg-cream pb-[var(--section-y)]">
        <div className="container-drp flex flex-wrap items-end justify-between gap-6 pb-10 pt-[var(--section-y)] sm:pb-12">
          <SectionHeading
            eyebrow="Explore Real Estate"
            heading="Available Now"
            headingId="listings-heading"
          />
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">Prices in</span>
            <CurrencySwitch />
          </div>
        </div>
        <PropertyExplorer />
        <div className="container-drp">
          <RecentlyViewed cards={listings.map(toPropertyCard)} className="pt-[var(--section-y)]" />
        </div>
      </section>
      <PropertyAlerts />
      <CtaBand
        eyebrow="Off-Market"
        heading="Not seeing the right home?"
        text="Many of our best properties are shared privately before they are listed. Tell us what you are looking for."
        button={{ label: 'Speak With a Specialist', href: '/contact' }}
        whatsappText="Hello DRP, I am looking for a property in Dubai."
      />
    </SiteShell>
  );
}
