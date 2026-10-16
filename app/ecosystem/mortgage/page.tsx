import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import MortgageCalculator from '@/components/ecosystem/MortgageCalculator';
import FaqList from '@/components/sections/FaqList';
import FormSection from '@/components/sections/FormSection';
import ProcessSteps from '@/components/sections/ProcessSteps';
import SectionHeading from '@/components/ui/SectionHeading';
import { mortgage as page } from '@/data/ecosystem';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Mortgage Assistance | Dubai Rapid Properties',
  description:
    'Dubai mortgage assistance for residents and non-residents: pre-approval, rate comparison across UAE lenders and the paperwork handled with your purchase.',
  path: '/ecosystem/mortgage',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      <section aria-labelledby="calc-heading" className="section-y bg-cream">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Mortgage Calculator"
            heading="What Would It Cost?"
            headingId="calc-heading"
            intro="Adjust the price, deposit, rate and term to estimate your monthly payment and the cash you need at transfer."
          />
          <div className="mt-12">
            <MortgageCalculator />
          </div>
        </div>
      </section>
      <ProcessSteps eyebrow="How It Works" heading="From Pre-Approval to Keys" steps={page.steps} tone="white" />
      <FaqList items={page.faqs} tone="cream" />
      <FormSection
        eyebrow="Pre-Approval"
        heading="Start your mortgage"
        intro="A D|R|P mortgage specialist will compare lenders for you and handle the paperwork."
        config={page.form}
        tone="white"
      />
    </SiteShell>
  );
}
