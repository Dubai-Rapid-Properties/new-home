'use client';

import { useId, useState } from 'react';
import { SliderField } from '../ecosystem/MortgageCalculator';
import { buyingCosts as c } from '@/data/tools';

const aed = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`;
const withVat = (n: number) => n * (1 + c.vatPct / 100);

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`h-11 border px-5 text-[12px] transition-colors duration-300 ${
        checked ? 'border-charcoal bg-charcoal text-white' : 'border-line bg-white text-charcoal hover:border-charcoal'
      }`}
    >
      {label}
    </button>
  );
}

/** Everything a Dubai buyer pays on top of the price, cash or with a mortgage. */
export default function BuyingCostsCalculator() {
  const uid = useId();
  const [price, setPrice] = useState(c.defaultPrice);
  const [mortgage, setMortgage] = useState(false);
  const [offPlan, setOffPlan] = useState(false);
  const [downPct, setDownPct] = useState(c.defaultDownPct);

  const loan = mortgage ? price * (1 - downPct / 100) : 0;
  const rows: [string, number][] = [
    [`DLD transfer fee (${c.dldPct}%)`, (price * c.dldPct) / 100 + c.dldAdminAed],
    ...(offPlan ? [] : ([
      ['Registration trustee fee (+ VAT)', withVat(c.trusteeAed(price))],
      [`Agency fee (${c.agencyPct}% + VAT)`, withVat((price * c.agencyPct) / 100)],
    ] as [string, number][])),
    ...(mortgage
      ? ([
          [`Mortgage registration (${c.mortgageRegPct}%)`, (loan * c.mortgageRegPct) / 100 + c.mortgageRegAdminAed],
          ['Bank valuation', c.valuationAed],
          [`Bank arrangement fee (up to ${c.arrangementPct}% + VAT)`, withVat((loan * c.arrangementPct) / 100)],
        ] as [string, number][])
      : []),
  ];
  const fees = rows.reduce((sum, [, v]) => sum + v, 0);
  const cashNeeded = (mortgage ? price - loan : price) + fees;

  return (
    <div className="grid grid-cols-1 gap-10 bg-white p-6 shadow-[0_24px_70px_-30px_rgba(26,26,26,0.18)] sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14">
      <div className="space-y-9 lg:col-span-7">
        <div>
          <label htmlFor={`${uid}-price`} className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
            Property price (AED)
          </label>
          <input
            id={`${uid}-price`}
            type="text"
            inputMode="numeric"
            value={price ? price.toLocaleString('en-US') : ''}
            onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, '')) || 0)}
            className="mt-3 w-full border-0 border-b border-line bg-transparent pb-2.5 font-serif text-[2rem] text-charcoal outline-none focus:border-orange"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle label="Buying with a mortgage" checked={mortgage} onChange={setMortgage} />
          <Toggle label="Off-plan, from the developer" checked={offPlan} onChange={setOffPlan} />
        </div>
        {mortgage ? (
          <SliderField
            id={`${uid}-down`}
            label="Down payment"
            value={downPct}
            onChange={setDownPct}
            min={20}
            max={80}
            step={5}
            display={`${downPct}% · ${aed(price - loan)}`}
          />
        ) : null}
        <p className="text-sm font-light leading-relaxed text-charcoal-muted">
          {offPlan
            ? 'Buying off-plan from the developer, there is usually no agency or trustee fee; the 4% is paid to register the sale (Oqood).'
            : 'Resale purchases are registered at a Land Department trustee office, with the agency fee paid at transfer.'}
        </p>
      </div>

      <div aria-live="polite" className="bg-ink p-8 text-white sm:p-10 lg:col-span-5">
        <p className="text-[10px] uppercase tracking-eyebrow text-white/50">Fees on top of the price</p>
        <p className="mt-3 font-serif text-[clamp(2.4rem,5vw,3.4rem)] font-light leading-none">{aed(fees)}</p>
        <p className="mt-2 text-sm font-light text-white/50">{price ? `${((fees / price) * 100).toFixed(1)}% of the price` : ''}</p>
        <dl className="mt-8 space-y-3 border-t border-white/15 pt-6 text-sm font-light">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-white/60">{k}</dt>
              <dd className="shrink-0">{aed(v)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-white/15 pt-3 text-base">
            <dt>{mortgage ? 'Cash needed (deposit + fees)' : 'Total cost'}</dt>
            <dd className="font-serif text-xl">{aed(cashNeeded)}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[11px] font-light leading-relaxed text-white/40">
          Estimates of the standard fees. Your D|R|P specialist confirms the exact costs for each purchase.
        </p>
      </div>
    </div>
  );
}
