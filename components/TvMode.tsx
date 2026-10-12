'use client';

import { useEffect } from 'react';
import { TV_BROWSER } from '@/lib/tv';

/**
 * Marks the page `data-tv` on TV browsers. Their graphics chips cannot keep
 * the hero video smooth while endless CSS animations (the partner strip,
 * the WhatsApp pulse) run on top of it, so globals.css stops those there.
 */
export default function TvMode() {
  useEffect(() => {
    if (TV_BROWSER.test(navigator.userAgent)) document.documentElement.dataset.tv = 'true';
  }, []);
  return null;
}
