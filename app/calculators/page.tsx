import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FaqList from '@/components/sections/FaqList';
import BuyingCostsCalculator from '@/components/tools/BuyingCostsCalculator';
import RentalYieldCalculator from '@/components/tools/RentalYieldCalculator';
import ArrowLink from '@/components/ui/ArrowLink';
import SectionHeading from '@/components/ui/SectionHeading';
import { calculatorsPage as page } from '@/data/tools';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Dubai Property Calculators: Buying Costs & Rental Yield | Dubai Rapid Properties',
  description: 'Estimate the DLD fee and other costs of buying in Dubai, and the gross and net rental yield of a property.',
  path: '/calculators',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      <section id="buying-costs" aria-labelledby="costs-heading" className="section-y scroll-mt-20 bg-cream">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Buying Costs"
            heading="What It Costs to Buy"
            headingId="costs-heading"
            intro="The Land Department fee, trustee and agency fees and, with a mortgage, the bank's costs."
          />
          <div className="mt-12">
            <BuyingCostsCalculator />
          </div>
          <div className="mt-8">
            <ArrowLink href="/ecosystem/mortgage" label="Estimate your monthly mortgage payment" />
          </div>
        </div>
      </section>
      <section id="rental-yield" aria-labelledby="yield-heading" className="section-y scroll-mt-20 bg-white">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Rental Yield"
            heading="What It Earns"
            headingId="yield-heading"
            intro="Gross yield on the price, and net yield after service charges, upkeep and management."
          />
          <div className="mt-12">
            <RentalYieldCalculator />
          </div>
          <div className="mt-8">
            <ArrowLink href="/property-management" label="How D|R|P manages and lets your home" />
          </div>
        </div>
      </section>
      <FaqList items={page.faqs} tone="cream" />
    </SiteShell>
  );
}
