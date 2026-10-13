'use client';

import { useCallback, useSyncExternalStore } from 'react';

const EMPTY: string[] = [];

/**
 * A short list of listing slugs kept in this browser (localStorage), shared
 * by every component that uses it and kept in step across tabs. Like the
 * saved list (lib/favourites.ts), it needs no account.
 */
export function createSlugStore(key: string, max: number) {
  let cache: string[] | null = null;

  const read = (): string[] => {
    if (cache) return cache;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]');
      cache = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string').slice(0, max) : [];
    } catch {
      cache = [];
    }
    return cache;
  };

  const write = (next: string[]) => {
    cache = next.slice(0, max);
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      /* Private mode or blocked storage: the list still works for this visit */
    }
    window.dispatchEvent(new Event(key));
  };

  const subscribe = (onChange: () => void) => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        onChange();
      }
    };
    window.addEventListener(key, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(key, onChange);
      window.removeEventListener('storage', onStorage);
    };
  };

  return function useSlugStore() {
    const slugs = useSyncExternalStore(subscribe, read, () => EMPTY);
    /** Puts a slug first, dropping the oldest past `max` */
    const add = useCallback((slug: string) => write([slug, ...read().filter((s) => s !== slug)]), []);
    const remove = useCallback((slug: string) => write(read().filter((s) => s !== slug)), []);
    const clear = useCallback(() => write([]), []);
    return { slugs, add, remove, clear, has: (slug: string) => slugs.includes(slug), full: slugs.length >= max, max };
  };
}

/** The listings this visitor opened last, newest first */
export const useRecentlyViewed = createSlugStore('drp:recent-listings', 8);
/** Up to three listings picked to compare side by side */
export const useCompare = createSlugStore('drp:compare-listings', 3);
