import PageHero from '@/components/PageHero';
import CareersForm from '@/components/careers/CareersForm';
import SiteShell from '@/components/layout/SiteShell';
import Reveal from '@/components/ui/Reveal';
import { careers } from '@/data/company';
import { contact } from '@/data/homepage';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Careers at D|R|P | Dubai Rapid Properties',
  description:
    'Build your real estate career in Dubai with D|R|P on Palm Jumeirah: market knowledge, guidance and the right environment to grow, since 2007.',
  path: '/careers',
});

export default function Page() {
  const { starting, join } = careers;

  return (
    <SiteShell>
      <PageHero {...careers.hero} />

      {/* ---------- Starting at DRP ---------- */}
      <section aria-labelledby="starting-heading" className="section-y bg-white">
        <div className="container-drp">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="eyebrow text-orange">{starting.eyebrow}</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 id="starting-heading" className="heading-display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-charcoal">
                  {starting.heading}
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.12} className="lg:col-span-7 lg:pt-10">
              <p className="text-[16px] font-light leading-[1.8] text-charcoal-light">{starting.text}</p>
            </Reveal>
          </div>

          <ol className="mt-14 grid grid-cols-1 gap-x-6 gap-y-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-x-5">
            {starting.pillars.map((p, i) => (
              <Reveal as="li" key={p} delay={(i % 6) * 0.06} className="border-t-2 border-orange pt-5">
                <span className="text-[11px] font-medium tracking-eyebrow text-charcoal-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-3 font-serif text-[1.45rem] font-light leading-snug text-charcoal">{p}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Want to join DRP? ---------- */}
      <section id="apply" aria-labelledby="join-heading" className="section-y scroll-mt-20 bg-cream">
        <div className="container-drp grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow text-orange">{join.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 id="join-heading" className="heading-display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-charcoal">
                {join.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 text-[15px] font-light leading-relaxed text-charcoal-muted">{join.text}</p>
            </Reveal>
            <p className="mt-10 text-sm font-light text-charcoal-muted">
              Prefer to talk first?{' '}
              <a
                href={`${contact.whatsappHref}?text=${encodeURIComponent('Hello D|R|P, I would like to ask about careers at D|R|P.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal underline-offset-4 hover:text-orange hover:underline"
              >
                WhatsApp {contact.whatsapp}
              </a>
            </p>
          </div>
          <Reveal delay={0.1} className="lg:col-span-8">
            <CareersForm />
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
