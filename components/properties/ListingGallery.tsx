'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';

type Props = {
  images: { src: string; alt: string }[];
  title: string;
  /** Frame shape; defaults to 4:3 on phones and 16:9 from sm */
  aspectClass?: string;
  sizes?: string;
};

const arrowClass =
  'flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-[0_6px_20px_rgba(26,26,26,0.18)] backdrop-blur-sm transition-colors duration-300 hover:text-orange';

/** Left / right swipes on touch screens; a short tap is left to the click handler. */
function useSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => {
      start.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.changedTouches[0].clientX - s.x;
      const dy = e.changedTouches[0].clientY - s.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onLeft : onRight)();
    },
  };
}

/** Main photograph with previous / next, swipe, thumbnails, arrow keys and a full-screen viewer. */
export default function ListingGallery({
  images,
  title,
  aspectClass = 'aspect-[4/3] sm:aspect-[16/9]',
  /* On a phone the 4:3 frame crops landscape photos, so ask for a wider image */
  sizes = '(max-width: 640px) 140vw, (max-width: 1320px) 100vw, 1320px',
}: Props) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);
  const close = useCallback(() => setOpen(false), []);
  const swipe = useSwipe(() => go(index + 1), () => go(index - 1));
  /* Only the photo on show and its neighbours are loaded, not all of them at once */
  const near = (i: number) => {
    const d = Math.abs(i - index);
    return d <= 1 || d >= count - 1;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'Enter') setOpen(true);
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
      <div className={`relative w-full overflow-hidden bg-line ${aspectClass}`} {...swipe}>
        {images.map((img, i) =>
          near(i) ? (
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
          ) : null,
        )}

        {/* Tapping the photo opens the full-screen viewer */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View photo ${index + 1} of ${count} full screen`}
          className="absolute inset-0 cursor-zoom-in"
        />
        <span className="pointer-events-none absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-white sm:left-6 sm:top-6">
          <Expand aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
        </span>

        {count > 1 ? (
          <>
            <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-6">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={`pointer-events-auto ${arrowClass}`}>
                <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={`pointer-events-auto ${arrowClass}`}>
                <ArrowRight aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>
            <p
              aria-live="polite"
              className="pointer-events-none absolute bottom-4 right-4 bg-ink/70 px-3 py-1.5 text-[11px] tracking-wide text-white sm:bottom-6 sm:right-6"
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

      {open ? <Viewer images={images} title={title} index={index} onIndex={go} onClose={close} /> : null}
    </div>
  );
}

/** Full-screen photo viewer: the whole photo, swipe or arrows to move, double-tap to zoom, Esc to close. */
function Viewer({
  images,
  title,
  index,
  onIndex,
  onClose,
}: {
  images: { src: string; alt: string }[];
  title: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const swipe = useSwipe(() => !zoom && onIndex(index + 1), () => !zoom && onIndex(index - 1));
  const lastTap = useRef(0);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => setZoom(false), [index]);

  /* Zoom in on the middle of the photo */
  useEffect(() => {
    const el = stage.current;
    if (zoom && el) el.scrollTo((el.scrollWidth - el.clientWidth) / 2, (el.scrollHeight - el.clientHeight) / 2);
  }, [zoom]);

  /* Lock the page behind, focus Close, and hand focus back on the way out */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex(index + 1);
      if (e.key === 'ArrowLeft') onIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, onClose, onIndex]);

  /* Double-tap (or double-click) toggles a 2x zoom; the zoomed photo scrolls to pan */
  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) setZoom((z) => !z);
    lastTap.current = now;
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-[100] flex flex-col bg-ink">
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <p aria-live="polite" className="text-[13px] tracking-wide text-white/80">
          {index + 1} / {count}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photos"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors duration-300 hover:text-orange"
        >
          <X aria-hidden="true" strokeWidth={1.5} className="h-6 w-6" />
        </button>
      </div>

      <div ref={stage} className={`relative min-h-0 flex-1 ${zoom ? 'overflow-auto' : 'overflow-hidden'}`} {...swipe} onClick={onTap}>
        <div className={`relative ${zoom ? 'h-[200%] w-[200%]' : 'h-full w-full'}`}>
          <Image
            key={images[index].src}
            src={images[index].src}
            alt={images[index].alt}
            fill
            sizes={zoom ? '200vw' : '100vw'}
            quality={85}
            priority
            className="select-none object-contain"
            draggable={false}
          />
        </div>
        {/* Load the neighbours so moving on is instant */}
        {count > 1
          ? [index + 1, index - 1].map((i) => {
              const img = images[(i + count) % count];
              return (
                <Image key={`pre-${img.src}`} src={img.src} alt="" fill sizes="100vw" quality={85} className="invisible object-contain" aria-hidden="true" />
              );
            })
          : null}
      </div>

      {count > 1 ? (
        <div className="flex items-center justify-center gap-6 px-4 py-4">
          <button type="button" onClick={() => onIndex(index - 1)} aria-label="Previous photo" className={arrowClass}>
            <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
          </button>
          <p className="hidden text-[12px] text-white/60 sm:block">Swipe, or use the arrow keys. Double-tap to zoom.</p>
          <button type="button" onClick={() => onIndex(index + 1)} aria-label="Next photo" className={arrowClass}>
            <ArrowRight aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
