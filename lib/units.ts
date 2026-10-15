/** Floor areas are stored in sq ft; visitors can read them in sq m. */
export type AreaUnit = 'sqft' | 'sqm';

export const SQFT_PER_SQM = 10.7639;

export const unitLabel = (unit: AreaUnit) => (unit === 'sqm' ? 'sq m' : 'sq ft');

/** A floor area in the chosen unit, e.g. "1,250 sq ft" or "116 sq m" */
export const formatSize = (sqft: number, unit: AreaUnit) =>
  `${Math.round(unit === 'sqm' ? sqft / SQFT_PER_SQM : sqft).toLocaleString('en-US')} ${unitLabel(unit)}`;

/** A price per sq ft as a price per unit of the chosen unit */
export const perUnit = (aedPerSqft: number, unit: AreaUnit) => Math.round(unit === 'sqm' ? aedPerSqft * SQFT_PER_SQM : aedPerSqft);
