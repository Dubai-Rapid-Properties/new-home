import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ListingGallery from '@/components/properties/ListingGallery';
import FaqList from '@/components/sections/FaqList';
import FeatureGrid from '@/components/sections/FeatureGrid';
import FormSection from '@/components/sections/FormSection';
import IntroSplit from '@/components/sections/IntroSplit';
import ProcessSteps from '@/components/sections/ProcessSteps';
import SectionHeading from '@/components/ui/SectionHeading';
import { fitOut as page } from '@/data/services';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Fit Out | Dubai Rapid Properties',
  description:
    'Turnkey fit-out in Dubai, from shell-and-core handover to a finished, rent-ready home: design, approvals and construction managed by one team.',
  path: '/fit-out',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      <IntroSplit eyebrow="D|R|P Fit Out" heading="One team, from drawings to keys" paragraphs={page.intro} />
      <FeatureGrid eyebrow="Scope" heading="What We Deliver" items={page.scope} tone="cream" />
      <section aria-labelledby="work-heading" className="section-y bg-white">
        <div className="container-drp">
          <SectionHeading eyebrow="Recent Work" heading="A Completed Bathroom" headingId="work-heading" />
          <div className="mt-12">
            <ListingGallery images={page.gallery} title="A Completed Bathroom" />
          </div>
        </div>
      </section>
      <ProcessSteps eyebrow="How It Works" heading="Four Stages" steps={page.steps} />
      <FaqList items={page.faqs} tone="cream" />
      <FormSection
        eyebrow="Site Survey"
        heading="Plan your fit-out"
        intro="Tell us what the property needs and we will arrange a survey."
        config={page.form}
        tone="white"
      />
    </SiteShell>
  );
}
