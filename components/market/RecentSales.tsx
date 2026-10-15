import { areaMarket, buildingSales, dayLabel, dldPeriod, formatAed, tidyName } from '@/lib/dld';
import type { Listing } from '@/data/properties';
import PricePerArea from '@/components/ui/PricePerArea';
import Size, { UnitName } from '@/components/ui/Size';

const HOME_TYPES = new Set<string>(['Apartment', 'Penthouse', 'Townhouse', 'Villa']);

const beds = (n: number | null, type: string) => (n == null ? type : n === 0 ? 'Studio' : `${n} BR`);

/**
 * What homes in the listing's building and area have sold for, from Dubai
 * Land Department's register. Renders nothing when DLD has no figures for
 * either.
 */
export default function RecentSales({ listing, headingId }: { listing: Listing; headingId: string }) {
  const building = buildingSales(listing.building, listing.area);
  const area = areaMarket(listing.area);
  /* DLD's figures are for homes; a shop or office is not comparable */
  if (!HOME_TYPES.has(listing.type)) return null;
  if (!building && !area?.medianPsf) return null;

  const ownPsf = listing.offering === 'buy' && listing.size > 0 ? Math.round(listing.price / listing.size) : null;
  const figures = [
    ...(ownPsf ? [{ label: 'This property', value: ownPsf, note: 'asking price' }] : []),
    ...(building?.medianPsf
      ? [{ label: listing.building ?? tidyName(building.name), value: building.medianPsf, note: `median of ${building.sales} ${building.sales === 1 ? 'sale' : 'sales'}` }]
      : []),
    ...(area?.medianPsf ? [{ label: listing.area, value: area.medianPsf, note: `median of ${area.sales.toLocaleString('en-US')} sales` }] : []),
  ];

  return (
    <section aria-labelledby={headingId} className="mt-14">
      <p className="eyebrow text-charcoal-muted">Dubai Land Department</p>
      <h2 id={headingId} className="mt-3 font-serif text-[1.75rem] font-light leading-snug text-charcoal">
        Recent Sales
      </h2>

      <dl className={`mt-6 grid grid-cols-1 border-t border-line ${figures.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {figures.map((f) => (
          <div key={f.label} className="border-b border-line py-5 pr-4">
            <dt className="truncate text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{f.label}</dt>
            <dd className="mt-2 text-[15px] text-charcoal">
              <PricePerArea aedPerSqft={f.value} />
              <span className="mt-1 block text-[12px] font-light text-charcoal-muted">{f.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      {building?.recent.length ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-[14px] font-light text-charcoal">
            <caption className="pb-3 text-left text-[13px] text-charcoal-muted">
              Latest registered sales in {listing.building ?? tidyName(building.name)}
            </caption>
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-eyebrow text-charcoal-muted">
                <th scope="col" className="py-3 pr-4 font-normal">Date</th>
                <th scope="col" className="py-3 pr-4 font-normal">Home</th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">Size</th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">Price</th>
                <th scope="col" className="py-3 text-right font-normal">Per <UnitName /></th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {building.recent.map((s, i) => (
                <tr key={`${s.date}-${i}`} className="border-b border-line">
                  <td className="whitespace-nowrap py-3 pr-4">{dayLabel(s.date)}</td>
                  <td className="whitespace-nowrap py-3 pr-4">
                    {beds(s.beds, s.type)}
                    {s.offPlan ? <span className="ml-2 text-[11px] text-charcoal-muted">off-plan</span> : null}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 text-right"><Size sqft={s.sqft} /></td>
                  <td className="whitespace-nowrap py-3 pr-4 text-right">{formatAed(s.price)}</td>
                  <td className="whitespace-nowrap py-3 text-right"><PricePerArea aedPerSqft={s.price / s.sqft} unit={false} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-4 text-xs font-light text-charcoal-muted/80">
        Residential sales registered with Dubai Land Department, {dayLabel(dldPeriod.from)} to {dayLabel(dldPeriod.to)}
        {building ? ` (as “${tidyName(building.name)}”)` : ''}. Indicative only: unit size, floor and view change the price.
      </p>
    </section>
  );
}
