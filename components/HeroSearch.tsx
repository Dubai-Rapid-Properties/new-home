'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { heroSearch, type Offering, type PriceOption } from '@/data/homepage';

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

function Chevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      aria-hidden="true"
      strokeWidth={1.75}
      className={`h-4 w-4 shrink-0 text-charcoal transition-transform duration-200 ${
        open ? 'rotate-180' : ''
      }`}
    />
  );
}

/** Trigger styling differs inside the white bar vs. the mobile pill row. */
const triggerClass = (variant: 'bar' | 'pill') =>
  variant === 'bar'
    ? 'flex h-full items-center gap-2 whitespace-nowrap px-4 text-[15px] text-charcoal'
    : 'flex h-12 w-full items-center justify-between gap-2 rounded-md bg-white px-4 text-[15px] text-charcoal shadow-[0_8px_30px_rgba(26,26,26,0.12)]';

const panelClass =
  'absolute left-0 z-30 rounded-md bg-white p-2 shadow-[0_12px_40px_rgba(26,26,26,0.18)]';

/**
 * The search bar sits low in the hero, so a panel that would run past the
 * bottom of the viewport opens upwards instead.
 */
function useFlip(open: boolean, estimatedHeight: number) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropUp(spaceBelow < estimatedHeight + 16 && rect.top > spaceBelow);
  }, [open, estimatedHeight]);

  return {
    anchorRef,
    placement: dropUp ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
    offset: dropUp ? 6 : -6,
  };
}

function useDropdownMotion(offset = -6) {
  const reduce = useReducedMotion();
  return reduce
    ? {}
    : {
        initial: { opacity: 0, y: offset },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: offset },
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
      };
}

/* -------------------------------------------------------------------------- */
/*  Beds                                                                      */
/* -------------------------------------------------------------------------- */

function bedsLabel(value: string | null) {
  if (!value) return 'Beds';
  if (value === 'Studio') return 'Studio';
  return value === '1' ? '1 Bed' : `${value} Beds`;
}

function BedsDropdown({
  value,
  onChange,
  open,
  onToggle,
  variant,
  idPrefix,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  open: boolean;
  onToggle: (next: boolean) => void;
  variant: 'bar' | 'pill';
  idPrefix: string;
}) {
  const { anchorRef, placement, offset } = useFlip(open, 264);
  const motionProps = useDropdownMotion(offset);
  const panelId = `${idPrefix}-beds-panel`;

  return (
    <div
      ref={anchorRef}
      className={variant === 'bar' ? 'relative h-full' : 'relative flex-1'}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => onToggle(!open)}
        className={triggerClass(variant)}
      >
        <span className={value ? 'text-charcoal' : 'text-charcoal-muted'}>
          {bedsLabel(value)}
        </span>
        <Chevron open={open} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            {...motionProps}
            className={`${panelClass} ${placement} w-40`}
            role="group"
            aria-label="Bedrooms"
          >
            <ul>
              {heroSearch.beds.map((b) => (
                <li key={b}>
                  <button
                    type="button"
                    aria-pressed={value === b}
                    onClick={() => {
                      onChange(value === b ? null : b);
                      onToggle(false);
                    }}
                    className={`w-full rounded px-3 py-2 text-left text-[15px] transition-colors duration-150 hover:bg-cream ${
                      value === b ? 'bg-cream font-medium text-orange' : 'text-charcoal'
                    }`}
                  >
                    {bedsLabel(b)}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Price range                                                               */
/* -------------------------------------------------------------------------- */

function priceLabel(min: PriceOption | null, max: PriceOption | null) {
  /* An "open" top option (50M+ / 1M+) means no upper bound. */
  const upper = max && !max.open ? max : null;
  if (min && upper) return `AED ${min.label} – ${upper.label}`;
  if (min) return `AED ${min.label}+`;
  if (upper) return `Up to AED ${upper.label}`;
  if (max?.open) return `AED ${max.label}`;
  return 'Price Range';
}

function PriceDropdown({
  options,
  min,
  max,
  onChange,
  open,
  onToggle,
  variant,
  idPrefix,
}: {
  options: PriceOption[];
  min: PriceOption | null;
  max: PriceOption | null;
  onChange: (min: PriceOption | null, max: PriceOption | null) => void;
  open: boolean;
  onToggle: (next: boolean) => void;
  variant: 'bar' | 'pill';
  idPrefix: string;
}) {
  const { anchorRef, placement, offset } = useFlip(open, 170);
  const motionProps = useDropdownMotion(offset);
  const panelId = `${idPrefix}-price-panel`;
  const chosen = Boolean(min || max);

  const find = (v: string) => options.find((o) => String(o.value) === v) ?? null;

  return (
    <div
      ref={anchorRef}
      className={variant === 'bar' ? 'relative h-full' : 'relative flex-1'}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => onToggle(!open)}
        className={triggerClass(variant)}
      >
        <span className={chosen ? 'text-charcoal' : 'text-charcoal-muted'}>
          {priceLabel(min, max)}
        </span>
        <Chevron open={open} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            {...motionProps}
            /* Price is the right-most control in both layouts, so the panel is
               right-aligned to stay on screen (it is 272px wide). */
            className={`${panelClass} ${placement} left-auto right-0 w-[17rem] p-4`}
            role="group"
            aria-label="Price range"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`${idPrefix}-min`}
                  className="block text-[10px] font-medium uppercase tracking-eyebrow text-charcoal-muted"
                >
                  Min
                </label>
                <select
                  id={`${idPrefix}-min`}
                  value={min ? String(min.value) : ''}
                  onChange={(e) => {
                    const next = find(e.target.value);
                    /* Drop an upper bound that is now below the new minimum */
                    const keepMax = next && max && !max.open && max.value <= next.value ? null : max;
                    onChange(next, keepMax);
                  }}
                  className="mt-1.5 w-full cursor-pointer rounded border border-line bg-white px-2 py-2 text-[14px] text-charcoal"
                >
                  <option value="">No min</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      AED {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${idPrefix}-max`}
                  className="block text-[10px] font-medium uppercase tracking-eyebrow text-charcoal-muted"
                >
                  Max
                </label>
                <select
                  id={`${idPrefix}-max`}
                  value={max ? String(max.value) : ''}
                  onChange={(e) => onChange(min, find(e.target.value))}
                  className="mt-1.5 w-full cursor-pointer rounded border border-line bg-white px-2 py-2 text-[14px] text-charcoal"
                >
                  <option value="">No max</option>
                  {options
                    .filter((o) => !min || o.open || o.value > min.value)
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        AED {o.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {chosen ? (
              <button
                type="button"
                onClick={() => onChange(null, null)}
                className="mt-3 text-[12px] text-charcoal-muted underline underline-offset-4 transition-colors hover:text-orange"
              >
                Clear price range
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero search                                                               */
/* -------------------------------------------------------------------------- */

type Panel = 'beds' | 'price' | null;

const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const bedsParam = (b: string) => (b === 'Studio' ? 'studio' : b === '5+' ? '5-plus' : b);

export default function HeroSearch() {
  const router = useRouter();
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  /* The mobile sheet is portalled to <body>, outside rootRef */
  const sheetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [offering, setOffering] = useState<Offering>('buy');
  const [query, setQuery] = useState('');
  const [beds, setBeds] = useState<string | null>(null);
  const [min, setMin] = useState<PriceOption | null>(null);
  const [max, setMax] = useState<PriceOption | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  /* The hero is inside a transformed (animated) ancestor, which creates a
     stacking context — so the sheet is portalled to <body> to escape it and
     sit above the floating WhatsApp button. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  /* Rent is priced per year, so the scale (and any chosen range) changes with it. */
  const priceOptions = offering === 'rent' ? heroSearch.rentPrices : heroSearch.salePrices;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits = heroSearch.locations.filter((l) => l.toLowerCase().includes(q));
    return [...hits.filter((l) => l.toLowerCase().startsWith(q)), ...hits.filter((l) => !l.toLowerCase().startsWith(q))].slice(0, 8);
  }, [query]);

  const showSuggestions = suggestOpen && suggestions.length > 0;

  const {
    anchorRef: suggestAnchorRef,
    placement: suggestPlacement,
    offset: suggestOffset,
  } = useFlip(showSuggestions, 264);
  const motionProps = useDropdownMotion(suggestOffset);

  /* Close any open panel on outside click or Escape */
  useEffect(() => {
    if (!panel && !suggestOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const inside = rootRef.current?.contains(target) || sheetRef.current?.contains(target);
      if (!inside) {
        setPanel(null);
        setSuggestOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanel(null);
        setSuggestOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [panel, suggestOpen]);

  /* Body scroll lock + Escape while the mobile search sheet is open */
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [sheetOpen]);

  const switchOffering = (next: Offering) => {
    setOffering(next);
    /* Sale and rent scales are not comparable — start the range fresh. */
    if ((next === 'rent') !== (offering === 'rent')) {
      setMin(null);
      setMax(null);
    }
    setPanel(null);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams({ offering });
    if (query.trim()) params.set('q', slug(query));
    if (beds) params.set('beds', bedsParam(beds));
    if (min) params.set('min', String(min.value));
    if (max && !max.open) params.set('max', String(max.value));
    setSheetOpen(false);
    router.push(`${heroSearch.destinations[offering]}?${params.toString()}`);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'ArrowDown' && suggestions.length) setSuggestOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      setQuery(suggestions[activeIndex]);
      setSuggestOpen(false);
      setActiveIndex(-1);
    }
  };

  /* One body, rendered inline on desktop and inside the sheet on mobile.
     `pfx` keeps the two copies' element ids distinct; `onLight` restyles the
     offering tabs for the cream sheet (they are white-on-photo in the hero). */
  const searchBody = (pfx: string, onLight = false) => {
    const listboxId = `${pfx}-locations`;
    return (
      <>
      {/* ---------- Row 1: offering tabs ---------- */}
      <div
        role="group"
        aria-label="What are you looking for?"
        className="grid grid-cols-3 gap-3 sm:flex sm:w-auto"
      >
        {heroSearch.tabs.map((tab) => {
          const active = offering === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={() => switchOffering(tab.id)}
              className={`rounded-md border px-4 py-3 text-[15px] transition-colors duration-300 sm:px-10 ${
                onLight
                  ? active
                    ? 'border-charcoal bg-charcoal font-medium text-white'
                    : 'border-charcoal/15 bg-white text-charcoal hover:border-charcoal/40'
                  : active
                    ? /* inset ring thickens the 1px border to 1.5px without shifting layout */
                      'border-white text-white shadow-[inset_0_0_0_0.5px_#fff]'
                    : 'border-white/35 text-white/85 hover:border-white/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---------- Row 2: white bar + separate search button ---------- */}
      <form
        onSubmit={submit}
        role="search"
        aria-label="Property search"
        className="mt-3 flex w-full flex-col gap-3 sm:max-w-[755px] sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="hero-search-bar relative flex h-12 w-full items-stretch rounded-md bg-white shadow-[0_8px_30px_rgba(26,26,26,0.14)] sm:w-auto sm:max-w-[620px] sm:flex-1">
          {/* Location input */}
          <div
            ref={suggestAnchorRef}
            className="relative flex min-w-0 flex-1 items-center gap-2.5 px-4"
          >
            <Search
              aria-hidden="true"
              strokeWidth={1.75}
              className="h-4 w-4 shrink-0 text-charcoal"
            />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
              }
              autoComplete="off"
              aria-label="Area, project or community"
              placeholder={heroSearch.placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setSuggestOpen(true)}
              onKeyDown={onInputKeyDown}
              /* The whole bar shows the focus state instead of the input */
              className="w-full min-w-0 border-0 bg-transparent p-0 text-[15px] text-charcoal placeholder:text-charcoal-muted focus:outline-none focus-visible:outline-none"
            />

            <AnimatePresence>
              {showSuggestions ? (
                <motion.ul
                  id={listboxId}
                  role="listbox"
                  aria-label="Location suggestions"
                  {...motionProps}
                  className={`${panelClass} ${suggestPlacement} max-h-64 w-[min(20rem,calc(100vw-2.5rem))] overflow-y-auto`}
                >
                  {suggestions.map((s, i) => (
                    <li key={s} role="none">
                      <button
                        type="button"
                        id={`${listboxId}-${i}`}
                        role="option"
                        aria-selected={i === activeIndex}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => {
                          setQuery(s);
                          setSuggestOpen(false);
                          setActiveIndex(-1);
                          inputRef.current?.focus();
                        }}
                        className={`w-full rounded px-3 py-2 text-left text-[15px] text-charcoal transition-colors duration-150 ${
                          i === activeIndex ? 'bg-cream' : ''
                        }`}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Beds + Price live inside the bar from sm up */}
          <div className="hidden items-stretch sm:flex">
            <BedsDropdown
              variant="bar"
              idPrefix={`${pfx}-bar`}
              value={beds}
              onChange={setBeds}
              open={panel === 'beds'}
              onToggle={(next) => setPanel(next ? 'beds' : null)}
            />
            <div aria-hidden="true" className="w-px self-stretch bg-line" />
            <PriceDropdown
              variant="bar"
              idPrefix={`${pfx}-bar`}
              options={priceOptions}
              min={min}
              max={max}
              onChange={(a, b) => {
                setMin(a);
                setMax(b);
              }}
              open={panel === 'price'}
              onToggle={(next) => setPanel(next ? 'price' : null)}
            />
          </div>
        </div>

        {/* Below 640px the two selects become their own pills */}
        <div className="flex gap-3 sm:hidden">
          <BedsDropdown
            variant="pill"
            idPrefix={`${pfx}-pill`}
            value={beds}
            onChange={setBeds}
            open={panel === 'beds'}
            onToggle={(next) => setPanel(next ? 'beds' : null)}
          />
          <PriceDropdown
            variant="pill"
            idPrefix={`${pfx}-pill`}
            options={priceOptions}
            min={min}
            max={max}
            onChange={(a, b) => {
              setMin(a);
              setMax(b);
            }}
            open={panel === 'price'}
            onToggle={(next) => setPanel(next ? 'price' : null)}
          />
        </div>

        <button
          type="submit"
          className="h-12 w-full shrink-0 rounded bg-[linear-gradient(180deg,#f47b49_0%,#e0662f_100%)] text-[15px] font-semibold text-white shadow-[0_6px_18px_rgba(224,102,47,0.35)] transition-[background,transform,box-shadow] duration-300 hover:-translate-y-px hover:bg-[linear-gradient(180deg,#ec6f3b_0%,#cf5a26_100%)] hover:shadow-[0_10px_24px_rgba(224,102,47,0.45)] sm:w-[115px]"
        >
          Search
        </button>
      </form>
      </>
    );
  };

  return (
    <div ref={rootRef}>
      {/* ---------- Desktop: full inline search (unchanged) ---------- */}
      <div className="hidden md:block">{searchBody(`${uid}-d`)}</div>

      {/* ---------- Mobile: one compact trigger bar ---------- */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        className="flex h-[52px] w-full items-center gap-3 rounded-md bg-white pl-4 pr-2 text-left shadow-[0_8px_30px_rgba(26,26,26,0.14)] md:hidden"
      >
        <Search aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0 text-charcoal" />
        <span className="min-w-0 flex-1 truncate text-[15px] text-charcoal-muted">
          {query.trim() ? query : 'Search properties in Dubai'}
        </span>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[linear-gradient(180deg,#f47b49_0%,#e0662f_100%)] text-white"
        >
          <Search strokeWidth={2} className="h-4 w-4" />
        </span>
      </button>

      {/* ---------- Mobile: full-screen bottom sheet (portalled) ---------- */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {sheetOpen ? (
                <div className="md:hidden">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-[80] bg-ink/70 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Search properties"
              initial={reduceMotion ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-[90] max-h-[90svh] overflow-y-auto overscroll-contain rounded-t-2xl bg-cream px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-eyebrow text-charcoal-muted">
                  Find a property
                </p>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close search"
                  className="-mr-2 flex h-11 w-11 items-center justify-center text-charcoal"
                >
                  <X className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              {searchBody(`${uid}-s`, true)}
            </motion.div>
                </div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
