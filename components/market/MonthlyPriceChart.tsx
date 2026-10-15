'use client';

import { useState } from 'react';
import { useAreaUnit } from '@/lib/areaUnit';
import { perUnit, unitLabel } from '@/lib/units';

export type MonthBar = { month: string; label: string; sales: number; medianPsf: number; partial: boolean };

/** Clean axis steps: 0, 1K, 2K… */
function ticks(max: number) {
  const raw = max / 3;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  return [0, step, step * 2, step * 3].filter((t, i) => i === 0 || t - step < max);
}
const compact = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

/**
 * Median AED per sq ft by month, one column per month. Hover or focus a
 * column for its figures; the table below carries every value too.
 */
export default function MonthlyPriceChart({ months: perSqft, caption }: { months: MonthBar[]; caption: string }) {
  const [active, setActive] = useState<number | null>(null);
  /* Figures come per sq ft; the visitor may read them per sq m */
  const { unit } = useAreaUnit();
  const per = unitLabel(unit);
  const months = perSqft.map((m) => ({ ...m, medianPsf: perUnit(m.medianPsf, unit) }));
  const axis = ticks(Math.max(...months.map((m) => m.medianPsf)));
  const top = axis[axis.length - 1];
  const shown = active == null ? null : months[active];

  return (
    <figure>
      <figcaption className="text-[13px] font-light text-charcoal-muted">{caption.replace(/sq ft/g, per)}</figcaption>
      <div className="relative mt-6 h-56 pl-10 sm:h-64">
        {/* Gridlines and their values */}
        {axis.map((t) => (
          <div key={t} aria-hidden="true" className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(t / top) * 100}%` }}>
            <span className="absolute -top-2 left-0 text-[11px] leading-none text-charcoal-muted">{compact(t)}</span>
          </div>
        ))}
        <ol className="relative flex h-full items-end justify-between gap-[2px]">
          {months.map((m, i) => (
            <li key={m.month} className="flex h-full flex-1 flex-col items-center justify-end">
              <button
                type="button"
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive((a) => (a === i ? null : a))}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((a) => (a === i ? null : a))}
                aria-label={`${m.label}: median AED ${m.medianPsf.toLocaleString('en-US')} per ${per}, ${m.sales.toLocaleString('en-US')} sales${m.partial ? ', month to date' : ''}`}
                className="group flex h-full w-full items-end justify-center outline-none"
              >
                <span
                  className={`block w-full max-w-6 rounded-t transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-charcoal ${
                    m.partial ? 'bg-orange/40' : active === i ? 'bg-orange-600' : 'bg-orange'
                  }`}
                  style={{ height: `${(m.medianPsf / top) * 100}%` }}
                />
              </button>
            </li>
          ))}
        </ol>
        {shown ? (
          <div
            role="status"
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-line bg-white px-3 py-2 text-[12px] shadow-md"
            style={{ left: `calc(2.5rem + (100% - 2.5rem) * ${(active! + 0.5) / months.length})` }}
          >
            <p className="font-medium text-charcoal">AED {shown.medianPsf.toLocaleString('en-US')} / {per}</p>
            <p className="font-light text-charcoal-muted">
              {shown.label} · {shown.sales.toLocaleString('en-US')} sales{shown.partial ? ' so far' : ''}
            </p>
          </div>
        ) : null}
      </div>
      <ol aria-hidden="true" className="mt-2 flex justify-between gap-[2px] pl-10 text-[11px] text-charcoal-muted">
        {months.map((m, i) => (
          <li key={m.month} className="flex-1 text-center">
            {/* Every other month on a phone */}
            <span className={i % 2 ? 'hidden sm:inline' : ''}>{m.label.slice(0, 3)}</span>
          </li>
        ))}
      </ol>

      <details className="mt-6 text-[13px] font-light text-charcoal-muted">
        <summary className="cursor-pointer text-charcoal hover:text-orange">Show the figures as a table</summary>
        <table className="mt-3 w-full max-w-md text-left tabular-nums">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-eyebrow">
              <th scope="col" className="py-2 font-normal">Month</th>
              <th scope="col" className="py-2 text-right font-normal">Median AED / {per}</th>
              <th scope="col" className="py-2 text-right font-normal">Sales</th>
            </tr>
          </thead>
          <tbody className="text-charcoal">
            {months.map((m) => (
              <tr key={m.month} className="border-b border-line">
                <td className="py-2">
                  {m.label}
                  {m.partial ? ' (to date)' : ''}
                </td>
                <td className="py-2 text-right">{m.medianPsf.toLocaleString('en-US')}</td>
                <td className="py-2 text-right">{m.sales.toLocaleString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
