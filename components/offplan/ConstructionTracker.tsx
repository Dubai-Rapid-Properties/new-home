'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ConstructionUpdate } from '@/data/offPlan';
import { constructionStage } from '@/lib/offPlanCards';
import SmartLink from '../ui/SmartLink';

const filters: { id: string; label: string; test: (c: ConstructionUpdate) => boolean }[] = [
  { id: 'all', label: 'All projects', test: () => true },
  { id: 'early', label: 'Early stages', test: (c) => c.progress != null && c.progress < 40 },
  { id: 'rising', label: 'Under construction', test: (c) => c.progress != null && c.progress >= 40 && c.progress < 75 },
  { id: 'nearing', label: 'Nearing completion', test: (c) => c.progress != null && c.progress >= 75 },
  { id: 'awaiting', label: 'Not yet reported', test: (c) => c.progress == null },
];

/* Rows shown at first, and added by each "Show more" */
const PAGE_SIZE = 40;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function Row({ c }: { c: ConstructionUpdate }) {
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        <Image
          src={c.image}
          alt={`${c.name} construction progress`}
          fill
          sizes="140px"
          className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
        />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{c.area}</p>
        <h3
          className={`mt-2 font-serif text-[1.35rem] leading-snug text-charcoal sm:text-[1.5rem] ${
            c.href ? 'transition-colors duration-300 group-hover:text-orange' : ''
          }`}
        >
          {c.name}
        </h3>
      </div>
      <div className="col-span-2 sm:col-span-1 sm:col-start-2 lg:col-start-auto">
        {c.progress != null ? (
          <>
            <div className="flex items-baseline justify-between gap-4 text-[12px]">
              <span className="text-charcoal">{constructionStage(c.progress)}</span>
              <span className="font-serif text-lg text-charcoal">{c.progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label={`${c.name} construction progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={c.progress}
              className="mt-2 h-1 w-full bg-line"
            >
              <div className="h-full bg-orange" style={{ width: `${c.progress}%` }} />
            </div>
          </>
        ) : (
          <>
            <p className="text-[12px] text-charcoal">Progress not yet reported</p>
            <div aria-hidden="true" className="mt-2 h-1 w-full bg-line" />
          </>
        )}
      </div>
      <p className="col-span-2 text-[11px] uppercase tracking-eyebrow text-charcoal-muted sm:col-span-1 sm:row-start-1 sm:col-start-3 sm:text-right lg:col-start-auto lg:row-start-auto">
        {c.updated ? 'Inspected' : 'Handover'}
        <span className="mt-1 block font-serif text-lg normal-case tracking-normal text-charcoal">
          {c.updated ? formatDate(c.updated) : (c.handoverYear ?? 'To be confirmed')}
        </span>
      </p>
    </>
  );
  const grid =
    'group grid grid-cols-[88px_1fr] items-center gap-x-5 gap-y-4 py-6 sm:grid-cols-[120px_1fr_auto] sm:gap-x-8 lg:grid-cols-[140px_1.2fr_1.6fr_auto]';
  return c.href ? (
    <SmartLink href={c.href} className={grid}>
      {body}
    </SmartLink>
  ) : (
    <div className={grid}>{body}</div>
  );
}

/**
 * Site progress for the off-plan projects on the site, filterable by stage.
 * The page passes the rows in (data/offPlan.ts stays on the server).
 */
export default function ConstructionTracker({ updates }: { updates: ConstructionUpdate[] }) {
  const [filterId, setFilterId] = useState('all');
  const [shown, setShown] = useState(PAGE_SIZE);
  const filter = filters.find((f) => f.id === filterId)!;
  const rows = updates.filter(filter.test);

  return (
    <div>
      <div role="group" aria-label="Filter by stage" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {filters.map((f) => {
          const active = f.id === filterId;
          const count = updates.filter(f.test).length;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilterId(f.id);
                setShown(PAGE_SIZE);
              }}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-[13px] transition-colors duration-300 ${
                active ? 'border-charcoal bg-charcoal text-white' : 'border-charcoal/20 bg-white text-charcoal hover:border-charcoal/50'
              }`}
            >
              {f.label}
              <span className={active ? 'text-white/60' : 'text-charcoal-muted'}>{count}</span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {rows.length} projects shown
      </p>

      <ul className="mt-10 border-t border-line">
        {rows.slice(0, shown).map((c) => (
          <li key={c.id} className="border-b border-line">
            <Row c={c} />
          </li>
        ))}
      </ul>
      {rows.length > shown ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-[11px] uppercase tracking-eyebrow text-charcoal-muted">
            Showing {shown} of {rows.length} projects
          </p>
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="border border-charcoal px-8 py-3 text-[11px] font-medium uppercase tracking-eyebrow text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-white"
          >
            Show more
          </button>
        </div>
      ) : null}
    </div>
  );
}
