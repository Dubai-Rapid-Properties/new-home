'use client';

import { usePathname } from 'next/navigation';
import { GitCompareArrows, X } from 'lucide-react';
import { useCompare } from '@/lib/slugStore';
import SmartLink from '../ui/SmartLink';

/** Bottom bar while properties are picked to compare: how many, Compare, Clear. */
export default function CompareTray() {
  const { slugs, clear, max } = useCompare();
  const pathname = usePathname();
  if (!slugs.length || pathname === '/properties/compare') return null;

  return (
    <div role="region" aria-label="Compare properties" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-3 bg-ink py-2.5 pl-5 pr-2.5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <GitCompareArrows aria-hidden="true" className="h-4 w-4 text-orange" strokeWidth={1.6} />
        <span className="whitespace-nowrap text-[13px]">
          {slugs.length} of {max} picked
        </span>
        <SmartLink
          href="/properties/compare"
          className="whitespace-nowrap bg-orange px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors hover:bg-[#e2612c]"
        >
          {slugs.length > 1 ? 'Compare' : 'Pick one more'}
        </SmartLink>
        <button type="button" onClick={clear} aria-label="Clear the comparison" className="p-1.5 text-white/60 hover:text-white">
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
