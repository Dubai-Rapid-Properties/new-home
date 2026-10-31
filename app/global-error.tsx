'use client';

import { useEffect, useState } from 'react';
import { reloadOnce } from '@/lib/reloadOnce';

/** When even the layout fails in the browser: reload once, then a plain message (app/error.tsx covers the rest). */
export default function GlobalError() {
  const [reloading, setReloading] = useState(true);
  useEffect(() => {
    if (!reloadOnce()) setReloading(false);
  }, []);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, textAlign: 'center' }}>
        {reloading ? (
          <p style={{ color: '#666' }}>Loading the latest version…</p>
        ) : (
          <div>
            <h1 style={{ fontWeight: 400 }}>This page couldn&rsquo;t load</h1>
            <p style={{ color: '#666' }}>Please try again in a moment.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 0, cursor: 'pointer' }}>
              Reload
            </button>
          </div>
        )}
      </body>
    </html>
  );
}
