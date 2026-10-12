import { ExternalLink, MapPin } from 'lucide-react';

type Props = {
  /** What Google Maps searches for, e.g. "Silverene Tower A, Dubai Marina, Dubai, UAE" */
  query: string;
  /** Shown above the map, e.g. "Silverene Tower A, Dubai Marina" */
  label: string;
  /** False when only the community is known, so the pin marks the area, not the building */
  exact: boolean;
  /** [lat, lng] of the building: Google Maps pins exactly there instead of searching for the name */
  near?: [number, number];
  headingId: string;
  tone?: 'light' | 'dark';
};

const embedSrc = (q: string, near?: [number, number]) =>
  `https://www.google.com/maps?q=${encodeURIComponent(near ? near.join(',') : q)}&z=${near ? 16 : 15}&output=embed`;
/* With the building's coordinates, Google Maps drops one pin there rather than listing every match for the name */
const mapsLink = (q: string, near?: [number, number]) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(near ? near.join(',') : q)}`;

/** Location heading, a Google map with the building pinned (or a Google search for it) and a link out to Google Maps. */
export default function PropertyMap({ query, label, exact, near, headingId, tone = 'light' }: Props) {
  const dark = tone === 'dark';
  return (
    <div>
      <p className={`eyebrow ${dark ? 'text-white/50' : 'text-charcoal-muted'}`}>Location</p>
      <h2
        id={headingId}
        className={`mt-3 flex items-start gap-3 font-serif text-[1.75rem] font-light leading-snug ${dark ? 'text-white' : 'text-charcoal'}`}
      >
        <MapPin aria-hidden="true" className="mt-2 h-5 w-5 shrink-0 text-orange" strokeWidth={1.5} />
        {label}
      </h2>
      {exact ? null : (
        <p className={`mt-2 text-sm font-light ${dark ? 'text-white/60' : 'text-charcoal-muted'}`}>
          The map shows the community. Ask us for the exact building.
        </p>
      )}
      <div className="relative mt-6 aspect-[4/3] overflow-hidden bg-line sm:aspect-[16/9]">
        <iframe
          src={embedSrc(query, near)}
          title={`Map of ${label}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 grayscale-[30%]"
        />
      </div>
      <a
        href={mapsLink(query, near)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-eyebrow transition-colors duration-300 hover:text-orange ${
          dark ? 'text-white' : 'text-charcoal'
        }`}
      >
        Open in Google Maps
        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
      </a>
    </div>
  );
}
