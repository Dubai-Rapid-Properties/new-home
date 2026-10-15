'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { AreaUnit } from './units';

/** The visitor's floor-area unit, remembered in this browser. */
const KEY = 'drp:area-unit';
const EVENT = 'drp:area-unit';

function read(): AreaUnit {
  try {
    return window.localStorage.getItem(KEY) === 'sqm' ? 'sqm' : 'sqft';
  } catch {
    return 'sqft';
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function useAreaUnit() {
  const unit = useSyncExternalStore(subscribe, read, () => 'sqft' as AreaUnit);
  const setUnit = useCallback((next: AreaUnit) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* Blocked storage: the choice holds until the page reloads */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { unit, setUnit };
}
