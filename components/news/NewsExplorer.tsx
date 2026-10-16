'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { articles, categories } from '@/data/news';
import ArticleCard from './ArticleCard';

function Explorer({ initial = 'all' }: { initial?: string }) {
  const [category, setCategory] = useState(
    categories.some((c) => c.id === initial) ? initial : 'all',
  );

  const select = (id: string) => {
    setCategory(id);
    const url = new URL(window.location.href);
    if (id === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', id);
    window.history.replaceState(null, '', url);
  };

  const shown =
    category === 'all' ? articles : articles.filter((a) => categories.find((c) => c.id === category)?.label === a.category);
  const [featured, ...rest] = shown;
  const tabs = [{ id: 'all', label: 'All' }, ...categories];

  return (
    <div>
      <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {tabs.map((t) => {
          const active = t.id === category;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => select(t.id)}
              className={`h-11 shrink-0 rounded-full border px-5 text-[13px] transition-colors duration-300 ${
                active ? 'border-charcoal bg-charcoal text-white' : 'border-charcoal/20 bg-white text-charcoal hover:border-charcoal/50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {shown.length} articles
      </p>

      {featured ? (
        <div className="mt-12 border-b border-line pb-14 sm:mt-16">
          <ArticleCard article={featured} featured />
        </div>
      ) : null}
      {rest.length ? (
        <ul className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {rest.map((a) => (
            <li key={a.slug}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ExplorerFromUrl() {
  const params = useSearchParams();
  return <Explorer initial={params.get('category') ?? 'all'} />;
}

/** Category-filtered article list for /news. Reads ?category= from the nav links. */
export default function NewsExplorer() {
  if (!articles.length) {
    return (
      <p className="max-w-xl text-[15px] font-light leading-relaxed text-charcoal/70">
        Our magazine is being refreshed. New market reports and insights from the D|R|P team are coming soon.
      </p>
    );
  }
  return (
    <Suspense fallback={<Explorer />}>
      <ExplorerFromUrl />
    </Suspense>
  );
}
