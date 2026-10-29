import { Check } from 'lucide-react';
import { SizeRange } from '@/components/ui/Size';
import UnitSwitch from '@/components/ui/UnitSwitch';
import SectionHeading from '@/components/ui/SectionHeading';
import { formatAed, unitName, type Project } from '@/data/offPlan';

const STAGES = ['On booking', 'During construction', 'On & after handover'];

/**
 * The project's units with their starting prices and sizes, and its payment
 * plan stage by stage: the developer's published figures.
 */
export function UnitsAndPlan({ project }: { project: Project }) {
  const units = project.units ?? [];
  const schedule = project.schedule;
  if (!units.length && !schedule) return null;
  const sized = units.some((u) => u.size);
  return (
    <section aria-labelledby="units-heading" className="section-y bg-cream">
      <div className="container-drp grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
        {units.length ? (
          <div className={schedule ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Units & Prices" heading="Starting prices by unit" headingId="units-heading" />
              {sized ? <UnitSwitch /> : null}
            </div>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-charcoal/20 text-[10px] uppercase tracking-eyebrow text-charcoal-muted">
                    <th scope="col" className="py-3 pr-4 font-medium">
                      Unit type
                    </th>
                    {sized ? (
                      <th scope="col" className="py-3 pr-4 font-medium">
                        Size
                      </th>
                    ) : null}
                    <th scope="col" className="py-3 text-right font-medium">
                      Starting price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={`${u.type}-${u.beds}`} className="border-b border-line">
                      <th scope="row" className="py-4 pr-4 text-[15px] font-normal text-charcoal">
                        {unitName(u)}
                      </th>
                      {sized ? (
                        <td className="py-4 pr-4 text-sm font-light text-charcoal-light">
                          {u.size ? <SizeRange from={u.size[0]} to={u.size[1]} /> : '-'}
                        </td>
                      ) : null}
                      <td className="py-4 text-right font-serif text-[1.1rem] text-charcoal">
                        {u.from ? formatAed(u.from) : 'On request'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs font-light text-charcoal-muted">
              The developer&apos;s published starting prices; a D|R|P specialist confirms current availability and prices.
            </p>
          </div>
        ) : null}
        {schedule ? (
          <div className={units.length ? 'lg:col-span-5' : 'lg:col-span-12'}>
            {units.length ? (
              <p className="eyebrow text-orange">Payment Plan</p>
            ) : (
              <SectionHeading eyebrow="Payment Plan" heading="Pay as it is built" headingId="units-heading" />
            )}
            <p className="mt-3 font-serif text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-charcoal">
              {schedule[0] + schedule[1]}/{schedule[2]} payment plan
            </p>
            <div className="mt-8 flex h-2 w-full overflow-hidden bg-white" aria-hidden="true">
              <div className="bg-orange" style={{ width: `${schedule[0]}%` }} />
              <div className="bg-charcoal" style={{ width: `${schedule[1]}%` }} />
              <div className="bg-charcoal/30" style={{ width: `${schedule[2]}%` }} />
            </div>
            <ul className="mt-6 border-t border-line">
              {schedule.map((pct, i) =>
                pct > 0 ? (
                  <li key={STAGES[i]} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                    <span className="flex items-center gap-3 text-[15px] text-charcoal">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${['bg-orange', 'bg-charcoal', 'bg-charcoal/30'][i]}`}
                      />
                      {STAGES[i]}
                    </span>
                    <span className="font-serif text-[1.35rem] text-charcoal">{pct}%</span>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Everything known about the project at a glance, and its amenities. */
export function DetailsAndAmenities({
  project,
  details,
}: {
  project: Project;
  details: [string, string][];
}) {
  const amenities = project.amenities ?? [];
  return (
    <section aria-labelledby="details-heading" className="section-y bg-white">
      <div className="container-drp grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
        <div className={amenities.length ? 'lg:col-span-5' : 'lg:col-span-8'}>
          <SectionHeading eyebrow="Project Details" heading="At a glance" headingId="details-heading" />
          <dl className="mt-10 border-t border-line">
            {details.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-4 sm:grid-cols-[11rem_1fr]">
                <dt className="text-[10px] uppercase leading-6 tracking-eyebrow text-charcoal-muted">{label}</dt>
                <dd className="text-[15px] text-charcoal">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {amenities.length ? (
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Amenities" heading={`Life at ${project.name}`} />
            <ul className="mt-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {amenities.map((a) => (
                <li key={a} className="flex items-center gap-3 border-b border-line py-3.5 text-[15px] font-light text-charcoal">
                  <Check aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-orange" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
