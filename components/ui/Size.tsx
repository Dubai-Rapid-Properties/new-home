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
