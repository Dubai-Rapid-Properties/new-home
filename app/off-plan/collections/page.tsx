import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ChoiceCard from '@/components/offplan/ChoiceCard';
import ProjectCard from '@/components/offplan/ProjectCard';
import ConsultationForm from '@/components/ConsultationForm';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { collectionHref, offPlanCollections, offPlanPages, signatureProjects } from '@/data/offPlan';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Investment Collections | Dubai Rapid Properties',
  description:
    'Dubai off-plan shortlists chosen by D|R|P: luxury homes, townhouses and villas, ROI and capital growth, and projects under AED 1.5M.',
  path: '/off-plan/collections',
});

const page = offPlanPages.collections;

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />

      <section aria-labelledby="collections-heading" className="section-y bg-cream">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Collections"
            heading="Find the Right Investment"
            headingId="collections-heading"
            intro="Each collection is a shortlist chosen by D|R|P's off-plan team."
          />
          <ul className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-8">
            {offPlanCollections.map((c, i) => (
              <Reveal as="li" key={c.slug} delay={(i % 2) * 0.08}>
                <ChoiceCard
                  title={c.title}
                  text={c.description}
                  meta={`${c.projects.length} projects`}
                  cta="Explore Collection"
                  href={collectionHref(c.slug)}
                  image={c.image}
                  alt={c.alt}
                  priority={i < 2}
                />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="signature-heading" className="section-y bg-white">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Signature Projects"
            heading="Handpicked by D|R|P"
            headingId="signature-heading"
            intro="Branded and ultra-luxury residences our team recommends right now."
          />
          <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            {signatureProjects.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 0.08}>
                <ProjectCard project={p} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        {...page.cta}
        form={<ConsultationForm context={{ section: 'Investment collections' }} />}
        whatsappText="Hello D|R|P, I would like a free consultation on off-plan investments."
      />
    </SiteShell>
  );
}
