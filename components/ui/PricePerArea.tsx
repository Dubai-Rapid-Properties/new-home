'use client';

import { formatIn } from '@/data/currency';
import { useAreaUnit } from '@/lib/areaUnit';
import { useCurrency } from '@/lib/currency';
import { perUnit, unitLabel } from '@/lib/units';

/**
 * A price per sq ft in the visitor's currency and area unit, e.g.
 * "AED 2,100 / sq ft" or "AED 22,604 / sq m". `unit={false}` leaves the
 * unit off, for tables whose heading names it.
 */
export default function PricePerArea({ aedPerSqft, unit: showUnit = true }: { aedPerSqft: number; unit?: boolean }) {
  const { unit } = useAreaUnit();
  const { code } = useCurrency();
  const price = formatIn(perUnit(aedPerSqft, unit), code);
  return <>{showUnit ? `${price} / ${unitLabel(unit)}` : price}</>;
}
