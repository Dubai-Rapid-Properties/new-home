import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LeadForm from '@/components/LeadForm';
import PageHero from '@/components/PageHero';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Reveal from '@/components/ui/Reveal';
import { listYourProperty as page } from '@/data/leadPages';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: page.metaTitle,
  description:
    'Sell or rent your Dubai property with D|R|P: the right positioning, qualified clients and the process managed from listing to completion.',
  path: '/list-your-property',
});

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <PageHero {...page.hero} />

        <section aria-label="Property details" className="section-y bg-cream">
          <div className="container-drp">
            <Reveal className="mx-auto max-w-3xl">
              <LeadForm config={page.form} />
            </Reveal>

            {/* Three facts, separated by hairline rules */}
            <ul className="mt-16 grid grid-cols-1 divide-y divide-line border-y border-line sm:mt-24 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {page.strip.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.index}
                  delay={i * 0.1}
                  className="py-7 sm:px-6 sm:py-10 sm:text-center"
                >
                  <p className="text-[11px] font-medium tracking-eyebrow text-orange">
                    {item.index}
                  </p>
                  <p className="mt-3 font-serif text-[1.6rem] font-light leading-tight text-charcoal sm:text-[1.85rem]">
                    {item.label}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
