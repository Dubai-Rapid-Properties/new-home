'use client';

import { partners, partnersLabel } from '@/data/homepage';

/**
 * Seamless developer-logo strip pinned to the bottom of the hero.
 *
 * The list is rendered twice and the track is translated by -50%, which makes
 * the loop seamless regardless of how many partners are in the data file.
 *
 * SWAPPING IN REAL LOGOS: drop monochrome white SVGs into /public/partners/
 * and set `logo` on the partner in /data/homepage.ts. Each item below renders
 * the image when a logo is present and falls back to the wordmark otherwise.
 */
export default function PartnerMarquee() {
  const items = [...partners, ...partners];

  return (
    /* No backdrop blur: blurring the playing video behind this strip on every
       frame made the video and the strip judder on TVs. */
    <div className="w-full border-t border-white/10 bg-ink/60">
      <div className="container-drp flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-8 sm:py-5">
        <p className="eyebrow shrink-0 text-white/45">{partnersLabel}</p>

        <div
          className="marquee-mask group relative flex-1 overflow-hidden"
          role="region"
          aria-label="Our development partners"
        >
          <div className="flex w-max will-change-transform animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {items.map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                /* The second copy is decorative — hide it from assistive tech */
                aria-hidden={i >= partners.length ? 'true' : undefined}
                className="flex shrink-0 items-center px-6 sm:px-9"
              >
                {partner.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-5 w-auto opacity-60 brightness-0 invert transition-opacity duration-500 hover:opacity-100 sm:h-6"
                  />
                ) : (
                  <span className="whitespace-nowrap text-[11px] font-light uppercase tracking-widest2 text-white/55 transition-colors duration-500 hover:text-white sm:text-xs">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
