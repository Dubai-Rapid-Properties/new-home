import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ProjectExplorer from '@/components/offplan/ProjectExplorer';
import CtaBand from '@/components/sections/CtaBand';
import { latestLaunches, offPlanPages } from '@/data/offPlan';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Latest Off-Plan Launches | Dubai Rapid Properties',
  description:
    'The latest off-plan launches in Dubai: new projects, starting prices, payment plans and handover dates, shortlisted by D|R|P.',
  path: '/off-plan/latest-launches',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...offPlanPages.latestLaunches.hero} />
      <ProjectExplorer
        source="latest-launches"
        isNew
        eyebrow="New Launches"
        heading="New to the Market"
        intro={`${latestLaunches.length} new projects, newest first.`}
      />
      <CtaBand
        eyebrow="Be First"
        heading="Hear about launches first"
        text="D|R|P clients get early access to new launches, with priority allocation and launch pricing."
        button={{ label: 'Contact Us', href: '/contact' }}
        whatsappText="Hello D|R|P, please keep me updated on new off-plan launches."
      />
    </SiteShell>
  );
}
