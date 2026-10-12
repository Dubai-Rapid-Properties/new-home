'use client';

import { useEffect } from 'react';
import { TV_BROWSER } from '@/lib/tv';

/**
 * Marks the page `data-tv` on TV browsers, whose graphics chips cannot keep
 * up with backdrop blur and some animations; globals.css turns those off there.
 */
export default function TvMode() {
  useEffect(() => {
    if (TV_BROWSER.test(navigator.userAgent)) document.documentElement.dataset.tv = 'true';
  }, []);
  return null;
}
