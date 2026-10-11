'use client';

import { useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Props = {
  images: { src: string; alt: string }[];
  title: string;
  /** Frame shape; defaults to 4:3 on phones and 16:9 from sm */
  aspectClass?: string;
  sizes?: string;
};

const arrowClass =
  'flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-[0_6px_20px_rgba(26,26,26,0.18)] backdrop-blur-sm transition-colors duration-300 hover:text-orange';

/** Main photograph with previous / next, thumbnails and arrow-key support. */
export default function ListingGallery({
  images,
  title,
  aspectClass = 'aspect-[4/3] sm:aspect-[16/9]',
  /* On a phone the 4:3 frame crops landscape photos, so ask for a wider image */
  sizes = '(max-width: 640px) 140vw, (max-width: 1320px) 100vw, 1320px',
}: Props) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (i: number) => setIndex((i + count) % count);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} photos`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="outline-none"
    >
      <div className={`relative w-full overflow-hidden bg-line ${aspectClass}`}>
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes={sizes}
            quality={85}
            className={`object-cover transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}

        {count > 1 ? (
          <>
            <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-6">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={arrowClass}>
                <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={arrowClass}>
                <ArrowRight aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>
            <p
              aria-live="polite"
              className="absolute bottom-4 right-4 bg-ink/70 px-3 py-1.5 text-[11px] tracking-wide text-white sm:bottom-6 sm:right-6"
            >
              {index + 1} / {count}
            </p>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}: ${img.alt}`}
                aria-current={i === index}
                className={`relative block h-16 w-24 overflow-hidden transition-opacity duration-300 sm:h-20 sm:w-32 ${
                  i === index ? 'opacity-100 ring-2 ring-orange ring-offset-2' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img.src} alt="" fill sizes="128px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
