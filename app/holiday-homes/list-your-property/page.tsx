import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FaqList from '@/components/sections/FaqList';
import FeatureGrid from '@/components/sections/FeatureGrid';
import FormSection from '@/components/sections/FormSection';
import ProcessSteps from '@/components/sections/ProcessSteps';
import { holidayHomes, holidayList, holidayListForm } from '@/data/services';

export const metadata = { title: 'List Your Holiday Home | D|R|P Holiday Homes' };

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...holidayList.hero} />
      <FormSection
        eyebrow="Earnings Estimate"
        heading="Tell us about your property"
        intro="Five quick questions. A specialist will come back with an estimate of nightly rates, occupancy and annual income."
        points={['No listing fees', 'Licensing handled for you', 'Use your home whenever you like']}
        config={holidayListForm}
      />
      <FeatureGrid eyebrow="What's Included" heading="Everything Handled" items={holidayList.included} />
      <ProcessSteps eyebrow="How It Works" heading="From Keys to Income" steps={holidayHomes.ownerSteps} tone="dark" />
      <FaqList items={holidayHomes.faqs} tone="cream" />
    </SiteShell>
  );
}
