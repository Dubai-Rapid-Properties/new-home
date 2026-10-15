import SectionHeading from '@/components/ui/SectionHeading';
import { areaMarket, dayLabel, dldPeriod, formatAed, monthLabel } from '@/lib/dld';
import PricePerArea from '@/components/ui/PricePerArea';
import { UnitName } from '@/components/ui/Size';
import UnitSwitch from '@/components/ui/UnitSwitch';
import MonthlyPriceChart from './MonthlyPriceChart';

/** Registered sales in an area this year: headline figures and price per sq ft by month. */
export default function AreaMarket({ area }: { area: string }) {
  const market = areaMarket(area);
  if (!market?.medianPsf) return null;

  const current = dldPeriod.to.slice(0, 7);
  const months = market.months
    .filter((m) => m.medianPsf != null)
    .map((m) => ({ ...m, medianPsf: m.medianPsf!, label: monthLabel(m.month, 'long'), partial: m.month === current }));
  const stats = [
    { key: 'psf', label: <>Median price per <UnitName /></>, value: <PricePerArea aedPerSqft={market.medianPsf} unit={false} /> },
    { key: 'price', label: 'Median sale price', value: market.medianPrice ? formatAed(market.medianPrice) : '—' },
    { key: 'sales', label: 'Homes sold this year', value: market.sales.toLocaleString('en-US') },
    { key: 'offplan', label: 'Sold off-plan', value: market.offPlanShare != null ? `${Math.round(market.offPlanShare * 100)}%` : '—' },
  ];

  return (
    <section aria-labelledby="market-heading" className="section-y bg-white">
      <div className="container-drp">
        <SectionHeading
          eyebrow="Dubai Land Department"
          heading={`${area} Market Snapshot`}
          headingId="market-heading"
          intro={`Residential sales registered in ${area} from ${dayLabel(dldPeriod.from)} to ${dayLabel(dldPeriod.to)}, updated daily.`}
        />
        <div className="mt-10 flex justify-end">
          <UnitSwitch />
        </div>
        <dl className="mt-4 grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.key} className="border-b border-line py-6 pr-4">
              <dt className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{s.label}</dt>
              <dd className="mt-3 font-serif text-[clamp(1.5rem,2.6vw,2.1rem)] font-light leading-none text-charcoal">{s.value}</dd>
            </div>
          ))}
        </dl>
        {months.length >= 3 ? (
          <div className="mt-14 max-w-4xl">
            <MonthlyPriceChart months={months} caption="Median price per sq ft (AED) by month" />
          </div>
        ) : null}
        <p className="mt-8 text-xs font-light text-charcoal-muted/80">
          Source: Dubai Land Department open data. Sales of apartments, villas and townhouses, ready and off-plan.
        </p>
      </div>
    </section>
  );
}
