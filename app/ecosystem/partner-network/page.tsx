import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FeatureGrid from '@/components/sections/FeatureGrid';
import FormSection from '@/components/sections/FormSection';
import SectionHeading from '@/components/ui/SectionHeading';
import { partnerNetwork as page } from '@/data/ecosystem';
import { partners } from '@/data/homepage';

export const metadata = { title: 'Partner Network | Dubai Rapid Properties' };

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      <section aria-labelledby="developers-heading" className="section-y bg-ink text-white">
        <div className="container-drp">
          <SectionHeading eyebrow="Development Partners" heading="Developers We Work With" headingId="developers-heading" tone="light" />
          <ul className="mt-12 grid grid-cols-2 border-l border-t border-white/10 sm:grid-cols-3 lg:grid-cols-5">
            {partners.map((p) => (
              <li
                key={p.name}
                className="flex h-28 items-center justify-center border-b border-r border-white/10 px-4 text-center font-serif text-xl tracking-wide text-white/80 sm:h-32"
              >
                {p.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.logo} alt={p.name} className="max-h-10 w-auto" />
                ) : (
                  p.name
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FeatureGrid eyebrow="The Network" heading="Every Specialist You Need" items={page.categories} />
      <FormSection
        eyebrow="Become a Partner"
        heading="Join the D|R|P network"
        intro="We partner with companies that share our standards. Tell us about yours."
        config={page.form}
      />
    </SiteShell>
  );
}
