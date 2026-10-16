import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartLink from '@/components/ui/SmartLink';
import { developerNetwork as page, developers } from '@/data/developers';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Developer Network | Dubai Rapid Properties',
  description:
    'Dubai’s leading property developers and the off-plan projects available from each of them through D|R|P.',
  path: '/off-plan/developers',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />

      <section aria-labelledby="developers-heading" className="section-y bg-cream">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Developers We Work With"
            heading={`${developers.length} Developers, One Team`}
            headingId="developers-heading"
            intro="Select a developer to see their projects available through D|R|P."
          />

          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {developers.map((d, i) => (
              <Reveal as="li" key={d.name} delay={(i % 4) * 0.05}>
                <SmartLink
                  href={d.href}
                  aria-label={`${d.name}: ${d.projects} ${d.projects === 1 ? 'project' : 'projects'}`}
                  className="group flex h-full flex-col bg-white transition-shadow duration-500 hover:shadow-[0_18px_40px_rgba(26,26,26,0.08)]"
                >
                  <div className="flex aspect-[3/2] items-center justify-center px-6 sm:px-8">
                    {d.logo ? (
                      /* One colour for every logo, whatever its original palette */
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={d.logo}
                        alt=""
                        loading="lazy"
                        /* A fixed box, so square and wide logos carry similar weight */
                        className="h-12 w-[78%] object-contain opacity-70 brightness-0 transition-opacity duration-500 group-hover:opacity-100 sm:h-14"
                        style={d.logoScale ? { transform: `scale(${d.logoScale})` } : undefined}
                      />
                    ) : (
                      <span className="text-center font-serif text-[1.35rem] uppercase leading-tight tracking-[0.12em] text-charcoal/75 transition-colors duration-500 group-hover:text-charcoal sm:text-[1.5rem]">
                        {d.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
                    <span className="truncate text-[12px] text-charcoal">{d.name}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-eyebrow text-charcoal-muted transition-colors duration-300 group-hover:text-orange">
                      {d.projects} {d.projects === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                </SmartLink>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        eyebrow="Off-Plan Advice"
        heading="Compare developers with a specialist"
        text="Track record, payment plans and handover history, set side by side for the projects you are considering."
        button={{ label: 'Speak with a Specialist', href: '/contact' }}
        whatsappText="Hello D|R|P, I would like advice on off-plan developers."
      />
    </SiteShell>
  );
}
