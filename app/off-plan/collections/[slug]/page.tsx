import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ProjectExplorer from '@/components/offplan/ProjectExplorer';
import ConsultationForm from '@/components/ConsultationForm';
import CtaBand from '@/components/sections/CtaBand';
import SmartLink from '@/components/ui/SmartLink';
import { collectionHref, getCollection, offPlanCollections } from '@/data/offPlan';

/** Next 16: route params arrive as a Promise and must be awaited. */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return offPlanCollections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const c = getCollection((await params).slug);
  return { title: c ? `${c.title} | Dubai Rapid Properties` : 'Investment Collections | Dubai Rapid Properties' };
}

export default async function Page({ params }: PageProps) {
  const c = getCollection((await params).slug);
  if (!c) notFound();
  const others = offPlanCollections.filter((o) => o.slug !== c.slug);

  return (
    <SiteShell>
      <PageHero eyebrow="Investment Collections" heading={c.title} intro={c.description} image={c.image} imageAlt={c.alt} />
      <ProjectExplorer
        source={c.slug}
        /* The luxury shortlist leads with its most exclusive projects */
        defaultSort={c.slug === 'luxury' ? 'price-desc' : 'newest'}
        eyebrow="The Collection"
        heading={`${c.projects.length} Projects`}
      />
      <nav aria-label="Other collections" className="bg-white py-12 sm:py-14">
        <div className="container-drp flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">Other collections</p>
          {others.map((o) => (
            <SmartLink key={o.slug} href={collectionHref(o.slug)} className="link-underline text-sm text-charcoal">
              {o.title}
            </SmartLink>
          ))}
          <SmartLink href="/off-plan/collections" className="link-underline text-sm text-charcoal">
            All collections
          </SmartLink>
        </div>
      </nav>
      <CtaBand
        eyebrow="Not Sure Which Investment Is Right for You?"
        heading="Book a free consultation"
        text="Our property experts are here to understand your goals and recommend the perfect opportunities."
        form={<ConsultationForm context={{ collection: c.title }} />}
        whatsappText={`Hello D|R|P, I would like advice on the ${c.title}.`}
      />
    </SiteShell>
  );
}
