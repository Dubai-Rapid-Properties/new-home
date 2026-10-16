import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadForm from '@/components/LeadForm';
import PageHero from '@/components/PageHero';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Reveal from '@/components/ui/Reveal';
import { propertyValuation as page } from '@/data/leadPages';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: page.metaTitle,
  description:
    'Know what your Dubai property is worth. Ask D|R|P for a valuation, the first step towards a successful sale or rental.',
  path: '/property-valuation',
});

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero {...page.hero} />

        <section aria-label="Request a valuation" className="section-y bg-cream">
          <div className="container-drp grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            {/* What happens next — numbered, hairline dividers, no boxes */}
            <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
              <Reveal>
                <h2
                  id="process-heading"
                  className="heading-display max-w-[14ch] text-[clamp(1.9rem,3.4vw,2.75rem)] text-charcoal"
                >
                  {page.process.heading}
                </h2>
              </Reveal>
              <ol aria-labelledby="process-heading" className="mt-8 border-t border-line sm:mt-10">
                {page.process.points.map((point, i) => (
                  <Reveal
                    as="li"
                    key={point}
                    delay={0.06 * i}
                    className="flex items-baseline gap-6 border-b border-line py-5 sm:py-6"
                  >
                    <span className="w-6 shrink-0 text-[11px] font-medium tracking-eyebrow text-orange">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[15px] font-light leading-relaxed text-charcoal sm:text-base">
                      {point}
                    </span>
                  </Reveal>
                ))}
              </ol>
            </div>

            <Reveal delay={0.1} className="lg:col-span-7">
              <LeadForm config={page.form} density="medium" />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
