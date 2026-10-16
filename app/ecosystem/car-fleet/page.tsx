import Image from 'next/image';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageHero from '@/components/PageHero';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import CarGallery from '@/components/carfleet/CarGallery';
import CtaBand from '@/components/sections/CtaBand';
import FeatureGrid from '@/components/sections/FeatureGrid';
import ProcessSteps from '@/components/sections/ProcessSteps';
import { carFleet as page } from '@/data/carFleet';
import { site } from '@/data/homepage';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: page.metaTitle,
  description:
    'The D|R|P car fleet: convenient vehicles for property owners, holiday-home guests and clients who need to get around during their stay in Dubai.',
  path: '/ecosystem/car-fleet',
});

const { car } = page;

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero {...page.hero} size="tall">
          {/* Brand lockup: reads as a DRP service, not a separate rental business */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t border-white/15 pt-6 sm:mt-16">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={site.logos.white}
                alt={`${site.name} logo`}
                className="h-8 w-[60px] object-contain object-left"
              />
              <span aria-hidden="true" className="h-6 w-px bg-white/25" />
              <span className="text-[10px] uppercase tracking-eyebrow text-white/60">
                Part of the D|R|P Ecosystem
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-eyebrow text-white/45">
              Property · Holiday Homes · Mobility
            </p>
          </div>
        </PageHero>

        {/* ---------- Intro ---------- */}
        <section aria-label="About the D|R|P car fleet" className="section-y bg-white">
          <div className="container-drp">
            <Reveal>
              <p className="max-w-4xl font-serif text-[clamp(1.4rem,2.6vw,2.1rem)] font-light leading-[1.35] text-charcoal">
                {page.intro}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- The car ---------- */}
        <section aria-labelledby="car-heading" className="section-y bg-cream">
          <div className="container-drp grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7 lg:order-2">
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-ink">
                <Image
                  src={car.image.src}
                  alt={car.image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div className="lg:col-span-5 lg:order-1">
              <Reveal>
                <p className="eyebrow text-orange">{car.eyebrow}</p>
              </Reveal>
              <Reveal delay={0.06}>
                <h2 id="car-heading" className="heading-display mt-5 text-[clamp(2.4rem,5vw,4rem)] text-charcoal">
                  <span className="block text-[0.45em] tracking-[0.3em] text-charcoal-muted">{car.make}</span>
                  {car.model}
                </h2>
                <p className="mt-3 text-[11px] uppercase tracking-eyebrow text-charcoal-muted">{car.type}</p>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="mt-8 space-y-4">
                  {car.description.map((p) => (
                    <p key={p} className="text-[15px] font-light leading-relaxed text-charcoal-light sm:text-base">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.18}>
                <dl className="mt-10 grid grid-cols-2 border-t border-line sm:grid-cols-3">
                  {car.specs.map((s) => (
                    <div key={s.label} className="border-b border-line py-4 pr-4">
                      <dt className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{s.label}</dt>
                      <dd className="mt-1.5 font-serif text-[1.25rem] leading-snug text-charcoal">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Gallery ---------- */}
        <section aria-labelledby="gallery-heading" className="section-y bg-white">
          <div className="container-drp">
            <SectionHeading eyebrow={page.gallery.eyebrow} heading={page.gallery.heading} headingId="gallery-heading" />
            <div className="mt-10 sm:mt-12">
              <CarGallery
                exterior={page.gallery.exterior}
                interior={page.gallery.interior}
                title={`${car.make} ${car.model}`}
              />
            </div>
          </div>
        </section>

        <FeatureGrid
          eyebrow={page.features.eyebrow}
          heading={page.features.heading}
          items={page.features.items}
          tone="cream"
        />

        <ProcessSteps
          eyebrow={page.service.eyebrow}
          heading={page.service.heading}
          intro={page.service.note}
          steps={page.service.steps}
          tone="white"
        />

        <CtaBand
          eyebrow={page.cta.eyebrow}
          heading={page.cta.heading}
          button={{ label: page.cta.label, href: page.cta.href }}
          whatsappText={page.cta.whatsappText}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
