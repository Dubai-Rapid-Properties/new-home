import Image from 'next/image';
import { about } from '@/data/company';
import Reveal from '../ui/Reveal';

/** Three large facts: the year over the reception, a photograph, a stacked list. */
export default function AboutFacts() {
  const [year, home, ecosystem] = about.facts;

  return (
    <section aria-label="D|R|P at a glance" className="bg-white pb-[var(--section-y)]">
      <div className="container-drp grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* 2007 — the reception; framed so the screen and the desk sign both stay in view */}
        <Reveal className="lg:col-span-4">
          <div className="relative flex aspect-[4/5] h-full flex-col justify-between overflow-hidden bg-ink p-8 sm:p-10 lg:aspect-auto lg:min-h-[520px]">
            {'image' in year && year.image ? (
              <Image
                src={year.image}
                alt={year.imageAlt ?? ''}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-[45%_8%]"
              />
            ) : null}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-ink/85 via-ink/15 to-transparent" />
            <p className="eyebrow relative text-orange">01</p>
            <div className="relative">
              <p className="font-serif text-[clamp(5.5rem,13vw,10rem)] font-light leading-[0.85] tracking-[-0.03em] text-white">
                {year.value as string}
              </p>
              <p className="mt-6 text-[11px] uppercase tracking-eyebrow text-white/70">{year.label}</p>
            </div>
          </div>
        </Reveal>

        {/* Palm Jumeirah — photograph */}
        <Reveal delay={0.08} className="lg:col-span-5">
          <div className="relative flex h-full min-h-[420px] flex-col justify-end overflow-hidden bg-ink p-8 sm:p-10 lg:min-h-[520px]">
            {'image' in home && home.image ? (
              <Image
                src={home.image}
                alt={home.imageAlt ?? ''}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            ) : null}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
            <div className="relative">
              <p className="eyebrow text-orange">02</p>
              <p className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.25rem)] font-light leading-[0.95] text-white">
                {home.value as string}
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-eyebrow text-white/70">{home.label}</p>
            </div>
          </div>
        </Reveal>

        {/* Ecosystem — stacked list */}
        <Reveal delay={0.16} className="lg:col-span-3">
          <div className="flex h-full min-h-[340px] flex-col justify-between bg-ink p-8 text-white sm:p-10 lg:min-h-[520px]">
            <p className="eyebrow text-orange">03</p>
            <div>
              <ul className="space-y-1">
                {(ecosystem.value as string[]).map((v) => (
                  <li key={v} className="whitespace-nowrap font-serif text-[clamp(1.7rem,2.4vw,2.15rem)] font-light leading-[1.15]">
                    {v}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[11px] uppercase tracking-eyebrow text-white/60">{ecosystem.label}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
