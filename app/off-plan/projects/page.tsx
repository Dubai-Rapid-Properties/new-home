import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ProjectExplorer from '@/components/offplan/ProjectExplorer';
import { offPlanPages } from '@/data/offPlan';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'All Off-Plan Projects | Dubai Rapid Properties',
  description:
    'Search Dubai off-plan projects by area, developer, price, bedrooms and handover date, with payment plans and launch prices from D|R|P.',
  path: '/off-plan/projects',
});

/** Every project, filterable; the hero search and the developer and area links land here. */
export default function Page() {
  return (
    <SiteShell>
      <PageHero {...offPlanPages.allProjects.hero} />
      <ProjectExplorer eyebrow="All Projects" heading="Search Off-Plan Projects" />
    </SiteShell>
  );
}
