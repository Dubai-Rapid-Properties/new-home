import { Plus } from 'lucide-react';
import JsonLd from '../JsonLd';
import { faqData } from '@/lib/structuredData';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';

export type Faq = { q: string; a: string };

type Props = {
  eyebrow?: string;
  heading?: string;
  items: Faq[];
  tone?: 'white' | 'cream';
};

/** Native <details> accordion — works without JavaScript. */
export default function FaqList({
  eyebrow = 'Questions',
  heading = 'Frequently Asked',
  items,
  tone = 'white',
}: Props) {
  return (
    <section
      aria-labelledby="faq-heading"
      className={`section-y ${tone === 'cream' ? 'bg-cream' : 'bg-white'}`}
    >
      <JsonLd data={faqData(items)} />
      <div className="container-drp grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={eyebrow} heading={heading} headingId="faq-heading" />
        </div>
        <Reveal className="lg:col-span-8">
          <div className="border-t border-line">
            {items.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-serif text-[1.3rem] font-light leading-snug text-charcoal sm:text-[1.45rem]">
                    {item.q}
                  </span>
                  <Plus
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="mt-1.5 h-5 w-5 shrink-0 text-orange transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="max-w-2xl pb-7 text-[15px] font-light leading-relaxed text-charcoal-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
