import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import PropertyCard from '@/components/PropertyCard';
import SiteShell from '@/components/layout/SiteShell';
import ProjectCard from '@/components/offplan/ProjectCard';
import AreaMarket from '@/components/market/AreaMarket';
import CtaBand from '@/components/sections/CtaBand';
import FeatureGrid from '@/components/sections/FeatureGrid';
import IntroSplit from '@/components/sections/IntroSplit';
import StatStrip from '@/components/sections/StatStrip';
import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { getArea } from '@/data/areas';
import { projects } from '@/data/offPlan';
import { listings, toPropertyCard } from '@/data/properties';
import { areaMarket, formatAed } from '@/lib/dld';
import { toSlug } from '@/lib/slug';
import { staticSlugs } from './slugs';

/** Next 16: route params arrive as a Promise and must be awaited. */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const area = getArea((await params).slug);
  return { title: area ? `${area.name} Area Guide | Dubai Rapid Properties` : 'Area Guide | Dubai Rapid Properties' };
}

export default async function Page({ params }: PageProps) {
  const area = getArea((await params).slug);
  if (!area) notFound();

  const homes = listings.filter((l) => l.area === area.name);
  const launches = projects.filter((p) => p.area === area.name);
  /* Dubai Land Department's registered sales replace the guide's indicative figure */
  const market = areaMarket(area.name);

  return (
    <SiteShell>
      <PageHero eyebrow="Area Guide" heading={area.name} intro={area.tagline} image={area.image} imageAlt={area.alt} />

      <StatStrip
        items={[
          market?.medianPsf
            ? { value: formatAed(market.medianPsf), label: 'Median price per sq ft (DLD)' }
            : { value: area.facts.pricePerSqft, label: 'Avg. price per sq ft' },
          { value: area.facts.rentalYield, label: 'Gross rental yield' },
          { value: area.facts.airport, label: 'To the airport' },
          { value: String(homes.length + launches.length), label: 'D|R|P listings & projects' },
        ]}
        note={`Typical homes: ${area.facts.homes}. Figures are indicative.`}
      />

      <IntroSplit eyebrow={`Living in ${area.name}`} heading="The Area at a Glance" paragraphs={area.intro} tone="cream" />

      <FeatureGrid eyebrow="Why Buyers Choose It" heading="What Sets It Apart" items={area.highlights} />

      <AreaMarket area={area.name} />

      {homes.length ? (
        <section aria-labelledby="homes-heading" className="section-y bg-cream">
          <div className="container-drp">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading eyebrow="Ready Properties" heading={`Homes in ${area.name}`} headingId="homes-heading" />
              <ArrowLink href={`/properties?q=${toSlug(area.name)}`} label="Search this area" />
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {homes.map((l, i) => (
                <Reveal as="li" key={l.slug} delay={(i % 3) * 0.08}>
                  <PropertyCard {...toPropertyCard(l)} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {launches.length ? (
        <section aria-labelledby="launches-heading" className={`section-y ${homes.length ? 'bg-white' : 'bg-cream'}`}>
          <div className="container-drp">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading eyebrow="Off-Plan" heading={`New Projects in ${area.name}`} headingId="launches-heading" />
              <ArrowLink href={`/off-plan/projects?q=${toSlug(area.name)}#projects`} label="All off-plan here" />
            </div>
            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {launches.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={(i % 3) * 0.08}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow={area.name}
        heading={`Buying or selling in ${area.name}?`}
        button={{ label: 'Speak With a Specialist', href: '/contact' }}
        whatsappText={`Hello D|R|P, I would like to talk about property in ${area.name}.`}
      />
    </SiteShell>
  );
}
