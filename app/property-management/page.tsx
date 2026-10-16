import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FaqList from '@/components/sections/FaqList';
import FeatureGrid from '@/components/sections/FeatureGrid';
import FormSection from '@/components/sections/FormSection';
import IntroSplit from '@/components/sections/IntroSplit';
import PackageCards from '@/components/sections/PackageCards';
import ProcessSteps from '@/components/sections/ProcessSteps';
import { propertyManagement as page } from '@/data/services';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Property Management | Dubai Rapid Properties',
  description:
    'Property management in Dubai by D|R|P: letting, tenants, rent, maintenance and statements for long-term and holiday-home owners, handled by one team.',
  path: '/property-management',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      <IntroSplit eyebrow="Property Management" heading="Your property, looked after" paragraphs={page.intro} />
      <ProcessSteps eyebrow="How It Works" heading="Four Steps, One Team" steps={page.steps} />
      <FeatureGrid eyebrow="Services" heading="What We Take Care Of" items={page.services} />
      <PackageCards
        eyebrow="Plans"
        heading="Choose Your Level of Service"
        packages={page.packages}
        tone="cream"
        ctaLabel="Request an appraisal"
        note="Indicative fees. Your exact fee is agreed after we assess the property."
      />
      <FaqList items={page.faqs} />
      <FormSection
        eyebrow="Get Started"
        heading="Request a free appraisal"
        intro="We will visit the property, advise on rent and recommend the right plan."
        config={page.form}
      />
    </SiteShell>
  );
}
