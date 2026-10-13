'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CalendarDays, MessageSquare } from 'lucide-react';
import BookViewing from './BookViewing';

const TABS = [
  { id: 'enquire', label: 'Enquire', Icon: MessageSquare },
  { id: 'viewing', label: 'Book a viewing', Icon: CalendarDays },
] as const;

/** The hash that opens the viewing tab, e.g. from the button under the price. */
export const VIEWING_HASH = '#book-viewing';

/**
 * The listing page's contact card: the enquiry form, or a viewing request
 * with a day and time. `enquiry` is the server-rendered enquiry form.
 */
export default function ListingContact({
  enquiry,
  context,
}: {
  enquiry: ReactNode;
  context: Record<string, string>;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('enquire');

  useEffect(() => {
    const open = () => {
      if (window.location.hash === VIEWING_HASH) setTab('viewing');
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);

  return (
    <div id={VIEWING_HASH.slice(1)} className="scroll-mt-28">
      <div role="tablist" aria-label="Contact about this property" className="grid grid-cols-2 border-b border-line bg-white">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`listing-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`listing-panel-${id}`}
            onClick={() => setTab(id)}
            className={`-mb-px flex h-14 items-center justify-center gap-2 border-b-2 text-[11px] font-medium uppercase tracking-eyebrow transition-colors duration-300 ${
              tab === id ? 'border-orange text-charcoal' : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Icon aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div id="listing-panel-enquire" role="tabpanel" aria-labelledby="listing-tab-enquire" hidden={tab !== 'enquire'}>
        {enquiry}
      </div>
      {tab === 'viewing' ? (
        <div
          id="listing-panel-viewing"
          role="tabpanel"
          aria-labelledby="listing-tab-viewing"
          className="bg-white px-5 py-8 shadow-[0_24px_70px_-30px_rgba(26,26,26,0.18)] sm:px-10 sm:py-10"
        >
          <h2 className="heading-display text-[clamp(1.75rem,3.4vw,2.6rem)] text-charcoal">Book a viewing</h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-muted">
            Pick a day and time that suit you. We will call to confirm.
          </p>
          <div className="mt-8">
            <BookViewing context={context} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
