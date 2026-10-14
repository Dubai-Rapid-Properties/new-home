import PageHero from '../PageHero';
import SiteShell from '../layout/SiteShell';
import CtaBand from '../sections/CtaBand';
import FaqList from '../sections/FaqList';
import FeatureGrid from '../sections/FeatureGrid';
import IntroSplit from '../sections/IntroSplit';
import ProcessSteps from '../sections/ProcessSteps';
import ArrowLink from '../ui/ArrowLink';
import type { Guide } from '@/data/guides';

/** Shared layout of the buyer's, seller's and Golden Visa guides. */
export default function GuidePage({ guide }: { guide: Guide }) {
  return (
    <SiteShell>
      <PageHero {...guide.hero} />
      <IntroSplit {...guide.intro} />
      <ProcessSteps
        eyebrow={guide.steps.eyebrow}
        heading={guide.steps.heading}
        intro={guide.steps.intro}
        steps={guide.steps.items}
        tone="cream"
      />
      {guide.extra ? (
        <FeatureGrid
          eyebrow={guide.extra.eyebrow}
          heading={guide.extra.heading}
          intro={guide.extra.intro}
          items={guide.extra.items}
          columns={2}
          tone="white"
        />
      ) : null}
      <FaqList items={guide.faqs} tone="cream" />
      <section aria-label="Related pages" className="bg-cream pb-[var(--section-y)]">
        <div className="container-drp">
          <p className="text-[11px] font-light leading-relaxed text-charcoal-muted">
            General guidance only. Rules and fees change, so D|R|P confirms the details for your own purchase or sale.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {guide.related.map((r) => (
              <li key={r.href}>
                <ArrowLink href={r.href} label={r.label} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand {...guide.cta} />
    </SiteShell>
  );
}
