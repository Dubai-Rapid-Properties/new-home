'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { hero } from '@/data/homepage';
import HeroSearch from './HeroSearch';
import PartnerMarquee from './PartnerMarquee';
import SmartLink from './ui/SmartLink';

export default function Hero() {
  const reduce = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  /* Mount the iframe after first paint so the poster and copy render first. */
  const [mountVideo, setMountVideo] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const id = window.setTimeout(() => setMountVideo(true), 300);
    return () => window.clearTimeout(id);
  }, [reduce]);

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col bg-ink lg:min-h-screen"
    >
      {/* ---------- Background: poster underneath, video fading in over it ---------- */}
      {/* A size container, so the video can cover the section's real box (cq units) */}
      <div className="absolute inset-0 overflow-hidden [container-type:size]">
        <Image
          src={hero.posterImage}
          alt={hero.posterAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {mountVideo ? (
          <iframe
            src={hero.videoSrc}
            title="Dubai Rapid Properties showreel"
            aria-hidden="true"
            tabIndex={-1}
            allow="autoplay; fullscreen"
            onLoad={() => setVideoReady(true)}
            /* 16:9 cover: sized from the section itself, which grows taller than the
               window when the window is short. Sizing from the viewport then left the
               frame narrower than 16:9 and Vimeo letterboxed it, showing a band at the top. */
            className={`pointer-events-none absolute left-1/2 top-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-1000 ${
              videoReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}
      </div>

      {/* ---------- Overlays: heavier at the bottom and along the left edge ----------
           The bottom scrim is a separate layer so the copy, quick links and
           partner strip stay legible over bright frames of the video without
           flattening the top of the picture. */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/25" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-ink/95 via-ink/60 to-transparent"
      />

      {/* ---------- Content ---------- */}
      <div className="relative z-20 flex flex-1 items-end pb-5 pt-24 sm:pb-14 sm:pt-32 lg:pb-20">
        <div className="container-drp">
          <motion.p {...rise(0.15)} className="eyebrow text-white/70">
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            {...rise(0.28)}
            className="heading-display mt-3 max-w-[16ch] text-[clamp(2.2rem,7vw,5.6rem)] text-white sm:mt-6"
          >
            {hero.heading}
          </motion.h1>

          <motion.p
            {...rise(0.42)}
            className="mt-3 line-clamp-2 max-w-xl text-[15px] font-light leading-relaxed text-white/75 sm:mt-6 sm:line-clamp-none sm:text-base"
          >
            {hero.paragraph}
          </motion.p>

          {/* Search — offering tabs above a white bar with a separate CTA */}
          <motion.div {...rise(0.52)} className="mt-5 sm:mt-8">
            <HeroSearch />
          </motion.div>

          {/* Quick links — one arrow per link, always inside its own <a>,
              immediately after its own label. No separators of any kind. */}
          <motion.nav
            {...rise(0.66)}
            aria-label="Hero quick links"
            className="mt-5 mb-6 pr-[72px] md:mt-10 md:mb-12 md:pr-0"
          >
            <ul className="flex flex-col divide-y divide-white/15 border-y border-white/15 md:flex-row md:flex-wrap md:items-center md:gap-x-14 md:gap-y-5 md:divide-y-0 md:border-0 lg:flex-nowrap lg:justify-between lg:gap-x-4">
              {hero.quickLinks.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    className="group flex h-10 items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white md:inline-flex md:h-auto md:justify-start md:text-[13px] md:tracking-[0.18em] lg:whitespace-nowrap lg:text-[11px] lg:tracking-[0.08em] xl:text-[12px] xl:tracking-[0.12em] 2xl:text-[13px] 2xl:tracking-[0.18em]"
                  >
                    <span className="relative after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full group-focus-visible:after:w-full">
                      {link.label}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      strokeWidth={2}
                      className="h-[14px] w-[14px] shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange group-focus-visible:translate-x-1 group-focus-visible:text-orange"
                    />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        </div>
      </div>

      {/* ---------- Partner strip, pinned to the bottom of the first screen ---------- */}
      <motion.div {...rise(0.88)} className="relative z-10 mt-auto">
        <PartnerMarquee />
      </motion.div>
    </section>
  );
}
