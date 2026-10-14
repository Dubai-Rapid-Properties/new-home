'use client';

import { useId, useState } from 'react';
import { SliderField } from '../ecosystem/MortgageCalculator';
import { rentalYield as c } from '@/data/tools';

const aed = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`;
const pct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;

function NumberField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value ? value.toLocaleString('en-US') : ''}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
        className="mt-3 w-full border-0 border-b border-line bg-transparent pb-2.5 font-serif text-2xl text-charcoal outline-none focus:border-orange"
      />
    </div>
  );
}

/** Gross and net rental yield for a let property. */
export default function RentalYieldCalculator() {
  const uid = useId();
  const [price, setPrice] = useState(c.defaultPrice);
  const [rent, setRent] = useState(c.defaultRent);
  const [size, setSize] = useState(c.defaultSize);
  const [serviceCharge, setServiceCharge] = useState(c.defaultServiceCharge);
  const [maintenancePct, setMaintenancePct] = useState(c.defaultMaintenancePct);
  const [managementPct, setManagementPct] = useState(c.defaultManagementPct);

  const service = size * serviceCharge;
  const maintenance = (rent * maintenancePct) / 100;
  const management = (rent * managementPct) / 100;
  const net = rent - service - maintenance - management;
  const invested = price * (1 + c.purchaseCostPct / 100);
  const gross = price ? (rent / price) * 100 : 0;
  const netYield = invested ? (net / invested) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-10 bg-white p-6 shadow-[0_24px_70px_-30px_rgba(26,26,26,0.18)] sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14">
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:col-span-7">
        <NumberField id={`${uid}-price`} label="Purchase price (AED)" value={price} onChange={setPrice} />
        <NumberField id={`${uid}-rent`} label="Annual rent (AED)" value={rent} onChange={setRent} />
        <NumberField id={`${uid}-size`} label="Size (sq ft)" value={size} onChange={setSize} />
        <SliderField
          id={`${uid}-service`}
          label="Service charge"
          value={serviceCharge}
          onChange={setServiceCharge}
          min={5}
          max={40}
          step={1}
          display={`AED ${serviceCharge} / sq ft`}
        />
        <SliderField
          id={`${uid}-maintenance`}
          label="Maintenance"
          value={maintenancePct}
          onChange={setMaintenancePct}
          min={0}
          max={15}
          step={1}
          display={`${maintenancePct}% of rent`}
        />
        <SliderField
          id={`${uid}-management`}
          label="Management fee"
          value={managementPct}
          onChange={setManagementPct}
          min={0}
          max={20}
          step={1}
          display={`${managementPct}% of rent`}
        />
      </div>

      <div aria-live="polite" className="bg-ink p-8 text-white sm:p-10 lg:col-span-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-eyebrow text-white/50">Gross yield</p>
            <p className="mt-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-light leading-none">{pct(gross)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-eyebrow text-white/50">Net yield</p>
            <p className="mt-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-light leading-none text-orange">{pct(netYield)}</p>
          </div>
        </div>
        <dl className="mt-8 space-y-3 border-t border-white/15 pt-6 text-sm font-light">
          {[
            ['Annual rent', aed(rent)],
            ['Service charge', `− ${aed(service)}`],
            ['Maintenance', `− ${aed(maintenance)}`],
            ['Management', `− ${aed(management)}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-white/60">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-white/15 pt-3 text-base">
            <dt>Net income a year</dt>
            <dd className="font-serif text-xl">{aed(net)}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[11px] font-light leading-relaxed text-white/40">
          Net yield is measured against the price plus about {c.purchaseCostPct}% purchase costs. Estimates only; D|R|P
          confirms achievable rent and service charges for a specific home.
        </p>
      </div>
    </div>
  );
}
