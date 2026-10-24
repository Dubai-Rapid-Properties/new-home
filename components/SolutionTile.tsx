'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { SolutionTile as Tile } from '@/data/homepage';
import { tileImageSizes } from './solutionLayout';
import SmartLink from './ui/SmartLink';

/**
 * Circular affordance in the corner of every tile. Decorative only — the whole
 * tile is already one <a>, so this is a <span> and never a nested <button>.
 */
function TileAction({ icon: Icon }: { icon: typeof ArrowRight }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/50 bg-transparent transition-[background-color,border-color,transform] duration-[400ms] ease-premium group-hover:-translate-y-0.5 group-hover:border-orange group-hover:bg-orange sm:h-11 sm:w-11"
    >
      <Icon
        strokeWidth={1.75}
        className="h-[18px] w-[18px] text-white transition-transform duration-[400ms] ease-premium group-hover:translate-x-[3px]"
      />
    </span>
  );
}

export default function SolutionTile({ tile }: { tile: Tile }) {
  const isReport = tile.variant === 'report';

  return (
    <SmartLink
      href={tile.href}
      external={tile.external}
      className={`group relative isolate block h-full w-full overflow-hidden ${
        isReport ? 'bg-charcoal' : 'bg-ink'
      }`}
    >
      {isReport ? (
        /* ---------- Editorial text card, no photograph (the magazine) ---------- */
        <div className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6 lg:p-7">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-orange/10 blur-2xl transition-opacity duration-700 group-hover:opacity-70"
          />
          <p className="eyebrow relative text-orange">{tile.reportLabel}</p>
          <div className="relative mt-6">
            <p className="font-serif text-[clamp(3rem,7vw,5rem)] font-light leading-none text-white">
              {tile.reportKicker}
            </p>
            <h3 className="mt-5 max-w-[22ch] text-[11px] font-medium uppercase tracking-eyebrow text-white sm:text-xs">
              {tile.title}
            </h3>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="max-w-[26ch] translate-y-1 text-xs font-light leading-relaxed text-white/60 transition-transform duration-[600ms] ease-premium group-hover:translate-y-0">
                {tile.subtitle}
              </p>
              <TileAction icon={ArrowRight} />
            </div>
          </div>
        </div>
      ) : (
        /* ---------- Photographic tile ---------- */
        <>
          <Image
            src={tile.image as string}
            alt={tile.alt ?? ''}
            fill
            loading="lazy"
            sizes={tileImageSizes[tile.span]}
            style={tile.imagePosition ? { objectPosition: tile.imagePosition } : undefined}
            className="object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.07]"
          />

          {/* Base gradient + a second layer that deepens on hover */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/0 transition-colors duration-[600ms] group-hover:bg-ink/20"
          />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
            <div className="flex items-end justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-white sm:tracking-eyebrow sm:text-xs">
                  {tile.title}
                </h3>
                {/* On the small 2-up mobile tiles the subtitle crowds the image,
                    so it only appears once there is room for it. */}
                <p
                  className={`mt-2 translate-y-1 text-xs font-light leading-relaxed text-white/70 transition-[transform,color] duration-[600ms] ease-premium group-hover:translate-y-0 group-hover:text-white/90 sm:text-[13px] ${
                    tile.span === 'standard' ? 'hidden sm:block' : ''
                  }`}
                >
                  {tile.subtitle}
                </p>
              </div>
              <TileAction icon={ArrowRight} />
            </div>
          </div>
        </>
      )}
    </SmartLink>
  );
}
