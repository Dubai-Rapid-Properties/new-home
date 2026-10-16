import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ChoiceCard from '@/components/offplan/ChoiceCard';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartLink from '@/components/ui/SmartLink';
import { offPlanPages, projects } from '@/data/offPlan';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Off-Plan Projects in Dubai | Dubai Rapid Properties',
  description:
    'Off-plan projects in Dubai from leading developers: latest launches, investment collections, payment plans and handover dates, with D|R|P specialists.',
  path: '/off-plan',
});

const page = offPlanPages.landing;

/** The off-plan front door, as on the DRP website: pick launches, collections or the tracker. */
export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />

      <section aria-labelledby="choose-heading" className="section-y bg-cream">
        <div className="container-drp">
          <SectionHeading eyebrow="Off-Plan" heading={page.chooseHeading} headingId="choose-heading" />
          <ul className="mt-12 grid gap-6 sm:mt-16 lg:gap-8">
            {page.choices.map((c, i) => (
              <Reveal as="li" key={c.href} delay={i * 0.08}>
                <ChoiceCard {...c} priority={i === 0} />
              </Reveal>
            ))}
          </ul>
          <p className="mt-10 text-sm font-light text-charcoal-muted">
            Know what you are looking for?{' '}
            <SmartLink href="/off-plan/projects" className="link-underline font-medium text-charcoal">
              Search all {projects.length} projects
            </SmartLink>{' '}
            or browse by{' '}
            <SmartLink href="/off-plan/developers" className="link-underline font-medium text-charcoal">
              developer
            </SmartLink>
            .
          </p>
        </div>
      </section>

      <section aria-label="Why invest off-plan with D|R|P" className="bg-white py-14 sm:py-16">
        <ul className="container-drp grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {page.benefits.map((b, i) => (
            <Reveal as="li" key={b.title} delay={i * 0.06} className="border-t border-line pt-5">
              <p className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal">{b.title}</p>
              <p className="mt-2 text-sm font-light leading-relaxed text-charcoal-muted">{b.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaBand
        eyebrow="Off-Plan Advice"
        heading="Speak to an off-plan specialist"
        text="Tell us your budget and goals, and we will shortlist the projects that fit."
        button={{ label: 'Contact Us', href: '/contact' }}
        whatsappText="Hello D|R|P, I would like advice on off-plan projects."
      />
    </SiteShell>
  );
}
