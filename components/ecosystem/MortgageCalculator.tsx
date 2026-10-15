'use client';

import { Suspense, useId, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { mortgage } from '@/data/ecosystem';

const c = mortgage.calculator;
const aed = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`;

/** Standard amortising repayment. */
export function monthlyPayment(loan: number, annualRatePct: number, years: number) {
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  if (loan <= 0 || n <= 0) return 0;
  if (r === 0) return loan / n;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

export type FieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
};

export function SliderField({ id, label, value, onChange, min, max, step, display }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
          {label}
        </label>
        <output htmlFor={id} className="font-serif text-xl text-charcoal">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 w-full cursor-pointer accent-orange"
      />
    </div>
  );
}

function Calculator({ initialPrice }: { initialPrice?: number }) {
  const uid = useId();
  const [price, setPrice] = useState(initialPrice ?? c.defaultPrice);
  const [downPct, setDownPct] = useState(c.defaultDownPct);
  const [rate, setRate] = useState(c.defaultRate);
  const [years, setYears] = useState(c.defaultYears);

  const down = (price * downPct) / 100;
  const loan = price - down;
  const monthly = monthlyPayment(loan, rate, years);
  const totalInterest = monthly * years * 12 - loan;

  const dld = (price * c.dldPct) / 100 + c.dldAdminAed;
  const registration = (loan * c.mortgageRegPct) / 100 + c.mortgageRegAdminAed;
  const agency = (price * c.agencyPct) / 100 * (1 + c.vatPct / 100);
  const fees = dld + registration + agency + c.valuationAed;

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
        <SliderField
          id={`${uid}-down`}
          label="Down payment"
          value={downPct}
          onChange={setDownPct}
          min={c.minDownPct}
          max={80}
          step={5}
          display={`${downPct}% · ${aed(down)}`}
        />
        <SliderField
          id={`${uid}-rate`}
          label="Interest rate"
          value={rate}
          onChange={setRate}
          min={c.minRate}
          max={9}
          step={0.05}
          display={`${rate.toFixed(2)}%`}
        />
        <SliderField
          id={`${uid}-years`}
          label="Term"
          value={years}
          onChange={setYears}
          min={5}
          max={25}
          step={1}
          display={`${years} years`}
        />
      </div>

      <div aria-live="polite" className="bg-ink p-8 text-white sm:p-10 lg:col-span-5">
        <p className="text-[10px] uppercase tracking-eyebrow text-white/50">Estimated monthly payment</p>
        <p className="mt-3 font-serif text-[clamp(2.4rem,5vw,3.4rem)] font-light leading-none">{aed(monthly)}</p>
        <dl className="mt-8 space-y-3 border-t border-white/15 pt-6 text-sm font-light">
          {[
            ['Loan amount', aed(loan)],
            ['Total interest', aed(Math.max(0, totalInterest))],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-white/60">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-[10px] uppercase tracking-eyebrow text-white/50">Estimated upfront costs</p>
        <dl className="mt-4 space-y-3 text-sm font-light">
          {[
            ['Down payment', aed(down)],
            [`DLD transfer fee (${c.dldPct}%)`, aed(dld)],
            ['Mortgage registration', aed(registration)],
            [`Agency fee (${c.agencyPct}% + VAT)`, aed(agency)],
            ['Bank valuation', aed(c.valuationAed)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-white/60">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-white/15 pt-3 text-base">
            <dt>Total cash needed</dt>
            <dd className="font-serif text-xl">{aed(down + fees)}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[11px] font-light leading-relaxed text-white/40">
          Estimates only. Rates, fees and lending limits vary by lender and buyer profile.
        </p>
      </div>
    </div>
  );
}

function CalculatorFromUrl() {
  const price = Number(useSearchParams().get('price'));
  return <Calculator initialPrice={price > 0 ? price : undefined} />;
}

/** Monthly payment + upfront cost estimate. Reads ?price= from listing links. */
export default function MortgageCalculator() {
  return (
    <Suspense fallback={<Calculator />}>
      <CalculatorFromUrl />
    </Suspense>
  );
}

/**
 * The calculator sized for a listing or project page: starts at its price,
 * shows the monthly payment, loan and term, and links to a DRP mortgage
 * specialist (the full calculator, with upfront costs, at /ecosystem/mortgage).
 */
export function ListingMortgage({ price: listPrice, headingId }: { price: number; headingId: string }) {
  const uid = useId();
  const [price, setPrice] = useState(listPrice);
  const [downPct, setDownPct] = useState(c.defaultDownPct);
  const [rate, setRate] = useState(c.defaultRate);
  const [years, setYears] = useState(c.defaultYears);

  const loan = price - (price * downPct) / 100;
  const monthly = monthlyPayment(loan, rate, years);

  return (
    <div>
      <h2 id={headingId} className="font-serif text-[1.75rem] font-light leading-snug text-charcoal">
        Calculate mortgage repayments
      </h2>
      <div className="mt-6 grid grid-cols-1 border border-line sm:grid-cols-2">
        <div className="space-y-7 p-6 sm:p-8">
          <div>
            <label htmlFor={`${uid}-price`} className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
              Total price (AED)
            </label>
            <input
              id={`${uid}-price`}
              type="text"
              inputMode="numeric"
              value={price ? price.toLocaleString('en-US') : ''}
              onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, '')) || 0)}
              className="mt-2 w-full border-0 border-b border-line bg-transparent pb-2 font-serif text-2xl text-charcoal outline-none focus:border-orange"
            />
          </div>
          <SliderField
            id={`${uid}-down`}
            label="Down payment"
            value={downPct}
            onChange={setDownPct}
            min={c.minDownPct}
            max={80}
            step={5}
            display={`${downPct}%`}
          />
          <SliderField
            id={`${uid}-years`}
            label="Loan period"
            value={years}
            onChange={setYears}
            min={5}
            max={25}
            step={1}
            display={`${years} years`}
          />
          <SliderField
            id={`${uid}-rate`}
            label="Interest rate"
            value={rate}
            onChange={setRate}
            min={c.minRate}
            max={9}
            step={0.05}
            display={`${rate.toFixed(2)}%`}
          />
        </div>

        <div aria-live="polite" className="flex flex-col bg-cream p-6 sm:p-8">
          <p className="font-serif text-[2.2rem] leading-none text-charcoal">{aed(monthly)}</p>
          <p className="mt-1.5 text-[11px] uppercase tracking-eyebrow text-charcoal-muted">per month</p>
          <dl className="mt-7 space-y-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="font-medium text-charcoal">Total loan amount</dt>
              <dd className="font-light text-charcoal-light">{aed(loan)}</dd>
            </div>
            <div>
              <dt className="font-medium text-charcoal">Duration</dt>
              <dd className="font-light text-charcoal-light">{years} years</dd>
            </div>
          </dl>
          <a
            href={`/ecosystem/mortgage?price=${price}`}
            className="mt-8 inline-flex h-11 items-center justify-center self-start bg-orange px-6 text-[12px] font-medium uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#e2612c]"
          >
            Get a free consultation
          </a>
          <p className="mt-4 text-[11px] font-light leading-relaxed text-charcoal-muted">
            An estimate. Rates and lending limits vary by lender and buyer.
          </p>
        </div>
      </div>
    </div>
  );
}
