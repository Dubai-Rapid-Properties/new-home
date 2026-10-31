'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reloadOnce } from '@/lib/reloadOnce';

/** A page that fails in the browser: reload once (usually a tab left open across a deploy), then say so. */
export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [reloading, setReloading] = useState(true);
  useEffect(() => {
    if (!reloadOnce()) setReloading(false);
  }, []);

  return (
    <section className="container-drp flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      {reloading ? (
        <p className="text-sm font-light text-charcoal-muted">Loading the latest version…</p>
      ) : (
        <>
          <h1 className="font-serif text-3xl text-charcoal">This page couldn&rsquo;t load</h1>
          <p className="mt-3 text-sm font-light text-charcoal-muted">Please try again in a moment.</p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => (reset(), window.location.reload())}
              className="h-11 bg-charcoal px-6 text-[12px] uppercase tracking-eyebrow text-white"
            >
              Reload
            </button>
            <Link href="/" className="flex h-11 items-center border border-charcoal px-6 text-[12px] uppercase tracking-eyebrow text-charcoal">
              Home
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
