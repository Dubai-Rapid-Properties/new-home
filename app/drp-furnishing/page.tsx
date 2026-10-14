import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ListingGallery from '@/components/properties/ListingGallery';
import FeatureGrid from '@/components/sections/FeatureGrid';
import FormSection from '@/components/sections/FormSection';
import IntroSplit from '@/components/sections/IntroSplit';
import PackageCards from '@/components/sections/PackageCards';
import ProcessSteps from '@/components/sections/ProcessSteps';
import StatStrip from '@/components/sections/StatStrip';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { furnishings, interiorDesign as page, whyItMatters } from '@/data/services';

export const metadata = { title: 'D|R|P Furnishing | Dubai Rapid Properties' };

/** Interior design, the furnishing packages and why furnishing matters, on one page. */
export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      <IntroSplit eyebrow="D|R|P Interiors" heading="Designed for the outcome" paragraphs={page.intro} />
      <FeatureGrid eyebrow="Services" heading="What We Design" items={page.services} columns={2} tone="cream" />
      <section aria-labelledby="work-heading" className="section-y bg-white">
        <div className="container-drp">
          <SectionHeading eyebrow="D|R|P Interiors" heading="Essentials & Signature" headingId="work-heading" />
          <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
            {page.showcase.map((s, i) => (
              <Reveal as="li" key={s.name} delay={i * 0.08}>
                {/* The name and line sit above the photos, so each gallery is labelled before it starts */}
                <h3 className="font-serif text-[1.9rem] leading-tight text-charcoal">{s.name}</h3>
                <p className="mt-2 font-light text-charcoal-muted">{s.text}</p>
                <div className="mt-6">
                  <ListingGallery
                    images={s.images}
                    title={`D|R|P ${s.name}`}
                    aspectClass="aspect-[4/3]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <a href="#packages" className="link-underline mt-5 inline-block text-[11px] font-medium text-charcoal">
                  See the package <span aria-hidden="true">&rarr;</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Furnishing packages (formerly /furnishings) */}
      <PackageCards
        id="packages"
        eyebrow="Furnishing Packages"
        heading="Three Ways to Furnish"
        intro={furnishings.intro[1]}
        packages={furnishings.packages}
        tone="cream"
        ctaLabel="Request a quote"
        note="Indicative package prices. Your quote is confirmed after a site visit."
      />

      {/* Why furnishing matters (formerly /furnishings/why-it-matters) */}
      <div id="why-it-matters" className="scroll-mt-20">
        <IntroSplit
          eyebrow="Why Furnishing Matters"
          heading="Decided in a single photo"
          paragraphs={whyItMatters.intro}
        />
        <StatStrip
          items={whyItMatters.stats}
          tone="cream"
          note="Compared with similar unfurnished or dated homes in the D|R|P portfolio. Indicative figures."
        />
        <FeatureGrid eyebrow="Where It Shows" heading="Six Ways Furnishing Pays" items={whyItMatters.reasons} />
      </div>

      <ProcessSteps eyebrow="Our Process" heading="From Brief to Final Styling" steps={page.steps} tone="dark" />
      <FormSection
        eyebrow="Enquire"
        heading="Furnish or design your property"
        intro="Tell us about the property and what you need: a furnishing package or a full design. A specialist will be in touch."
        config={page.form}
      />
    </SiteShell>
  );
}
