import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ConstructionTracker from '@/components/offplan/ConstructionTracker';
import CtaBand from '@/components/sections/CtaBand';
import SectionHeading from '@/components/ui/SectionHeading';
import { constructionUpdates, trackerCheckedOn } from '@/data/offPlan';
import { unsplash } from '@/lib/media';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Construction Tracker | Dubai Rapid Properties',
  description:
    'Construction progress for Dubai off-plan projects from their latest site inspections, checked every Monday.',
  path: '/off-plan/construction-tracker',
});

const checkedLabel = new Date(trackerCheckedOn).toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Off-Plan"
        heading="Construction Tracker"
        intro="Site progress for Dubai's off-plan projects, from each project's latest site inspection, checked every Monday."
        // DEMO PLACEHOLDER – swap for DRP site photography
        image={unsplash('1504307651254-35680f356dfd', 2000)}
        imageAlt="Construction under way on a new development"
      />
      <section aria-labelledby="tracker-heading" className="section-y bg-cream">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Site Progress"
            heading="Every Project, One View"
            headingId="tracker-heading"
            intro={`${constructionUpdates.length} projects, newest launches first. Each figure is from the project's latest site inspection by Dubai Land Department (its open data, Property Finder or D|R|P's construction reports, whichever is newest), so each project shows its own inspection date. The figures are checked every Monday; last checked ${checkedLabel}.`}
          />
          <div className="mt-12">
            <ConstructionTracker updates={constructionUpdates} />
          </div>
        </div>
      </section>
      <CtaBand
        eyebrow="Already Own Off-Plan?"
        heading="We will track it for you"
        text="D|R|P clients receive milestone updates, snagging support and handover management for their units."
        button={{ label: 'Speak to the Team', href: '/contact' }}
        whatsappText="Hello D|R|P, I would like an update on my off-plan purchase."
      />
    </SiteShell>
  );
}
