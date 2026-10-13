'use client';

import { GitCompareArrows } from 'lucide-react';
import { useCompare } from '@/lib/slugStore';

/** Adds a listing to, or removes it from, the comparison (up to three). */
export default function CompareButton({ slug, title, variant = 'overlay' }: { slug: string; title: string; variant?: 'overlay' | 'inline' }) {
  const { has, add, remove, full, max } = useCompare();
  const picked = has(slug);
  const blocked = !picked && full;
  const label = picked ? `Remove ${title} from the comparison` : blocked ? `You can compare up to ${max} properties` : `Compare ${title}`;
  const toggle = () => (picked ? remove(slug) : blocked ? undefined : add(slug));

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={picked}
        title={blocked ? label : undefined}
        disabled={blocked}
        className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[12px] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
          picked ? 'border-charcoal bg-charcoal text-white' : 'border-charcoal/20 text-charcoal hover:border-charcoal'
        }`}
      >
        <GitCompareArrows aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
        {picked ? 'Comparing' : 'Compare'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        /* The card around it is a link */
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={picked}
      aria-label={label}
      title={picked ? 'Comparing' : blocked ? label : 'Compare'}
      className={`absolute right-14 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300 ${
        picked ? 'bg-charcoal text-white' : blocked ? 'cursor-not-allowed bg-white/70 text-charcoal/40' : 'bg-white/90 text-charcoal hover:text-orange'
      }`}
    >
      <GitCompareArrows aria-hidden="true" className="h-4 w-4" strokeWidth={1.6} />
    </button>
  );
}
