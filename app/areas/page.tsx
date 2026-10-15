import Image from 'next/image';
import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartLink from '@/components/ui/SmartLink';
import { areas, factPsf } from '@/data/areas';
import { projects } from '@/data/offPlan';
import { listings } from '@/data/properties';
import PricePerArea from '@/components/ui/PricePerArea';
import UnitSwitch from '@/components/ui/UnitSwitch';
import { areaMarket } from '@/lib/dld';
import { unsplash } from '@/lib/media';

export const metadata = { title: 'Dubai Area Guides | Dubai Rapid Properties' };

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Dubai Areas"
        heading="Explore Dubai's Communities"
        intro="Where to live and where to invest: price benchmarks, rental yields and lifestyle notes for the areas we know best."
        // DEMO PLACEHOLDER – swap for DRP photography
        image={unsplash('1512453979798-5ea266f8880c', 2000)}
        imageAlt="An aerial view of the Dubai skyline at dusk"
      />
      <section aria-labelledby="areas-heading" className="section-y bg-white">
        <div className="container-drp">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Area Guides" heading={`${areas.length} Communities`} headingId="areas-heading" />
            <UnitSwitch />
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {areas.map((a, i) => {
              const homes = listings.filter((l) => l.area === a.name).length;
              const launches = projects.filter((p) => p.area === a.name).length;
              /* The same figure as the area's own page: DLD's median when it has one */
              const median = areaMarket(a.name)?.medianPsf;
              return (
                <Reveal as="li" key={a.slug} delay={(i % 3) * 0.08}>
                  <SmartLink href={`/areas/${a.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-line">
                      <Image
                        src={a.image}
                        alt={a.alt}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.06]"
                      />
                    </div>
                    <h3 className="mt-5 font-serif text-[1.65rem] leading-snug text-charcoal transition-colors duration-300 group-hover:text-orange">
                      {a.name}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-charcoal-muted">{a.tagline}</p>
                    <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4 text-[10px] font-light uppercase tracking-wide text-charcoal-muted">
                      <span>
                        {median ? 'Median' : 'Avg.'} <PricePerArea aedPerSqft={median ?? factPsf(a)} />
                      </span>
                      <span>
                        {homes ? `${homes} ready` : ''}
                        {homes && launches ? ' · ' : ''}
                        {launches ? `${launches} off-plan` : ''}
                      </span>
                    </div>
                  </SmartLink>
                </Reveal>
              );
            })}
          </ul>
          <p className="mt-14 text-xs font-light text-charcoal-muted/80">
            Median price per area from Dubai Land Department's registered sales this year; an indicative average where DLD has too few sales.
          </p>
        </div>
      </section>
      <CtaBand
        eyebrow="Not Sure Where?"
        heading="Let us shortlist the right community"
        button={{ label: 'Speak With a Specialist', href: '/contact' }}
        whatsappText="Hello D|R|P, I would like advice on which area of Dubai suits me."
      />
    </SiteShell>
  );
}
