import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { site } from '@/data/homepage';
import TvMode from '@/components/TvMode';
import { Analytics } from '@vercel/analytics/next';
import JsonLd from '@/components/JsonLd';
import { organisation } from '@/lib/structuredData';
import { indexable, siteUrl } from '@/lib/siteUrl';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dubai Rapid Properties | Dubai Real Estate. Global Perspective.',
  description: site.tagline,
  metadataBase: new URL(siteUrl),
  /* app/icon.png and app/apple-icon.png are picked up by Next */
  openGraph: {
    title: 'Dubai Rapid Properties',
    description: site.tagline,
    type: 'website',
    locale: 'en_AE',
    siteName: site.name,
  },
  /* Keep *.vercel.app and preview deployments out of search results */
  robots: indexable ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* data-scroll-behavior lets Next 16 switch off the smooth scrolling set in
       globals.css while it resets scroll on navigation, so new pages always
       open at the top. In-page anchors keep their smooth scroll. */
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* The hero video is the largest first-paint asset — warm the connection early. */}
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>
        {children}
        <TvMode />
        <JsonLd data={organisation()} />
        {/* Vercel Web Analytics: cookieless page views, switched on in the Vercel project */}
        <Analytics />
      </body>
    </html>
  );
}
