import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FaqList from '@/components/sections/FaqList';
import FeatureGrid from '@/components/sections/FeatureGrid';
import FormSection from '@/components/sections/FormSection';
import IntroSplit from '@/components/sections/IntroSplit';
import ProcessSteps from '@/components/sections/ProcessSteps';
import { companyFormation as page } from '@/data/ecosystem';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Company Formation | Dubai Rapid Properties',
  description:
    'Free-zone, offshore and mainland company structures for investors who hold Dubai property through a company, set up alongside the purchase.',
  path: '/ecosystem/company-formation',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      <IntroSplit eyebrow="Company Formation" heading="Own property the right way" paragraphs={page.intro} />
      <FeatureGrid eyebrow="Structures" heading="Three Common Options" items={page.structures} tone="cream" />
      <ProcessSteps eyebrow="How It Works" heading="Set Up Alongside Your Purchase" steps={page.steps} tone="dark" />
      <section aria-labelledby="docs-heading" className="section-y bg-white">
        <div className="container-drp grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow text-orange">Documents</p>
            <h2 id="docs-heading" className="heading-display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-charcoal">
              What you will need
            </h2>
          </div>
          <ol className="border-t border-line lg:col-span-7">
            {page.documents.map((d, i) => (
              <li key={d} className="flex items-baseline gap-6 border-b border-line py-5">
                <span className="w-6 shrink-0 text-[11px] font-medium tracking-eyebrow text-orange">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[15px] font-light text-charcoal sm:text-base">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <FaqList items={page.faqs} tone="cream" />
      <FormSection
        eyebrow="Consultation"
        heading="Talk through your structure"
        intro="A short call to understand your plans, then a clear recommendation."
        config={page.form}
        tone="white"
      />
    </SiteShell>
  );
}
