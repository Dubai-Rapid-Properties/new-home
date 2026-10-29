'use client';

import { useAreaUnit } from '@/lib/areaUnit';
import { formatSize, unitLabel } from '@/lib/units';

/** A floor area (stored in sq ft) in the visitor's chosen unit. */
export default function Size({ sqft }: { sqft: number }) {
  const { unit } = useAreaUnit();
  return <>{formatSize(sqft, unit)}</>;
}

/** "sq ft" or "sq m", following the visitor's choice. */
export function UnitName() {
  const { unit } = useAreaUnit();
  return <>{unitLabel(unit)}</>;
}

/** A size range, e.g. "650 - 1,200 sq ft", or one size when both ends match. */
export function SizeRange({ from, to }: { from: number; to: number }) {
  const { unit } = useAreaUnit();
  if (Math.round(from) === Math.round(to)) return <>{formatSize(from, unit)}</>;
  const [a] = formatSize(from, unit).split(' ');
  return (
    <>
      {a} - {formatSize(to, unit)}
    </>
  );
}
