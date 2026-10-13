import nearbyData from './imported/nearby.json';

/** A place near a listing, from OpenStreetMap (scripts/sync-nearby.mjs) */
export type NearbyPlace = { name: string; km: number };
export type Nearby = {
  schools: NearbyPlace[];
  restaurants: NearbyPlace[];
  hospitals: NearbyPlace[];
  metro: NearbyPlace[];
};

const data = nearbyData as Record<string, Partial<Nearby> & { fetchedAt?: string }>;

/** What is near a building, or null when nothing is known yet */
export function nearbyFor(near?: [number, number]): Nearby | null {
  if (!near) return null;
  const entry = data[`${near[0].toFixed(3)},${near[1].toFixed(3)}`];
  if (!entry) return null;
  const nearby: Nearby = {
    schools: entry.schools ?? [],
    restaurants: entry.restaurants ?? [],
    hospitals: entry.hospitals ?? [],
    metro: entry.metro ?? [],
  };
  return Object.values(nearby).some((list) => list.length) ? nearby : null;
}
