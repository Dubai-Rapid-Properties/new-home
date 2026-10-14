import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ChoiceCard from '@/components/offplan/ChoiceCard';
import ProjectCard from '@/components/offplan/ProjectCard';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { collectionHref, offPlanCollections, offPlanPages, signatureProjects } from '@/data/offPlan';

export const metadata = { title: 'Investment Collections | Dubai Rapid Properties' };

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
        button={{ label: 'Book a Free Consultation', href: '/contact' }}
        whatsappText="Hello D|R|P, I would like a free consultation on off-plan investments."
      />
    </SiteShell>
  );
}
