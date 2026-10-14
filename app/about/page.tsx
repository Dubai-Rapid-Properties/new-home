import PageHero from '@/components/PageHero';
import AboutFacts from '@/components/about/AboutFacts';
import EcosystemBand from '@/components/about/EcosystemBand';
import TeamGrid from '@/components/about/TeamGrid';
import SiteShell from '@/components/layout/SiteShell';
import CtaBand from '@/components/sections/CtaBand';
import Reveal from '@/components/ui/Reveal';
import { about } from '@/data/company';

export const metadata = { title: 'About D|R|P | Dubai Rapid Properties' };

export default function Page() {
  const [lead, second] = about.intro;

  return (
    <SiteShell>
      <PageHero {...about.hero} />

      <section aria-label="Introduction" className="bg-white pb-14 pt-[var(--section-y)] sm:pb-20">
        <div className="container-drp grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="font-serif text-[clamp(1.45rem,2.5vw,2.1rem)] font-light leading-[1.35] text-charcoal">{lead}</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pt-3">
            <p className="text-[15px] font-light leading-relaxed text-charcoal-light sm:text-base">{second}</p>
          </Reveal>
        </div>
      </section>

      <AboutFacts />
      <EcosystemBand />
      <TeamGrid />

      <CtaBand
        eyebrow="Careers at D|R|P"
        heading="Want to join the team?"
        button={{ label: 'Careers at D|R|P', href: '/careers' }}
      />
    </SiteShell>
  );
}
