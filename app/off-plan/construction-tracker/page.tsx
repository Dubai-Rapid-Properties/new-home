import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ConstructionTracker from '@/components/offplan/ConstructionTracker';
import CtaBand from '@/components/sections/CtaBand';
import SectionHeading from '@/components/ui/SectionHeading';
import { constructionUpdates } from '@/data/offPlan';
import { unsplash } from '@/lib/media';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Construction Tracker | Dubai Rapid Properties',
  description:
    'Construction progress for the Dubai off-plan projects D|R|P follows, updated as developers report each milestone.',
  path: '/off-plan/construction-tracker',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Off-Plan"
        heading="Construction Tracker"
        intro="Site progress for the off-plan projects D|R|P follows, updated as developers report each milestone."
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
            intro={`${constructionUpdates.length} projects, most advanced first. Figures come from Dubai Land Department's latest site inspections, and D|R|P's construction status reports where DLD has none.`}
          />
          <div className="mt-12">
            <ConstructionTracker />
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
