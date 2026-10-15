'use client';

import { useAreaUnit } from '@/lib/areaUnit';
import { unitLabel, type AreaUnit } from '@/lib/units';

const UNITS: AreaUnit[] = ['sqft', 'sqm'];

/** Switches floor areas and prices per area between sq ft and sq m. */
export default function UnitSwitch({ className = '' }: { className?: string }) {
  const { unit, setUnit } = useAreaUnit();
  return (
    <div role="group" aria-label="Show areas in" className={`inline-flex h-10 rounded-full border border-charcoal/20 p-1 ${className}`}>
      {UNITS.map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={unit === u}
          onClick={() => setUnit(u)}
          className={`rounded-full px-3 text-[12px] transition-colors duration-300 ${
            unit === u ? 'bg-charcoal text-white' : 'text-charcoal hover:text-orange'
          }`}
        >
          {unitLabel(u)}
        </button>
      ))}
    </div>
  );
}
