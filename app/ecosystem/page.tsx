import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartLink from '@/components/ui/SmartLink';
import { ecosystem } from '@/data/ecosystem';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'The D|R|P Ecosystem | Dubai Rapid Properties',
  description:
    'Buying, financing, furnishing, letting and looking after a home in Dubai with one team: the D|R|P property ecosystem.',
  path: '/ecosystem',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...ecosystem.hero} />
      {ecosystem.groups.map((group, gi) => (
        <section
          key={group.title}
          aria-labelledby={`group-${gi}`}
          className={`section-y ${gi % 2 ? 'bg-cream' : 'bg-white'}`}
        >
          <div className="container-drp grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow={String(gi + 1).padStart(2, '0')}
                heading={group.title}
                headingId={`group-${gi}`}
              />
            </div>
            <ul className="grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:col-span-8">
              {group.services.map((s, i) => (
                <Reveal as="li" key={s.name} delay={i * 0.05} className="border-b border-line sm:odd:pr-8 sm:even:border-l sm:even:pl-8">
                  <SmartLink href={s.href} className="group flex h-full items-start justify-between gap-6 py-7">
                    <span>
                      <span className="block font-serif text-[1.55rem] leading-snug text-charcoal transition-colors duration-300 group-hover:text-orange">
                        {s.name}
                      </span>
                      <span className="mt-2 block text-sm font-light text-charcoal-muted">{s.text}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-2 text-charcoal transition-[transform,color] duration-500 ease-premium group-hover:translate-x-1.5 group-hover:text-orange"
                    >
                      &rarr;
                    </span>
                  </SmartLink>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <CtaBand
        eyebrow="One Team"
        heading="Not sure where to start?"
        text="Tell us what you are planning and we will bring in the right people."
        button={{ label: 'Speak With a Specialist', href: '/contact' }}
      />
    </SiteShell>
  );
}
