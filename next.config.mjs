import { legacyRedirects } from './scripts/legacy-redirects.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      /* The team is now a section of /about */
      { source: '/about/team', destination: '/about#team', permanent: true },
      /* Furnishing packages and why furnishing matters are sections of DRP Furnishing */
      { source: '/furnishings', destination: '/drp-furnishing#packages', permanent: true },
      { source: '/furnishings/why-it-matters', destination: '/drp-furnishing#why-it-matters', permanent: true },
      /* Stays are listed and booked on the Holiday Homes website */
      { source: '/holiday-homes/book-a-stay', destination: 'https://stay.dubairapidproperties.com', permanent: true },
      /* Interior Design is now DRP Furnishing */
      { source: '/interior-design', destination: '/drp-furnishing', permanent: true },
      /* One car fleet page, under the DRP Ecosystem */
      { source: '/car-fleet', destination: '/ecosystem/car-fleet', permanent: true },
      /* The Wave Crest landing page's address on the old WordPress site */
      { source: '/palm-jebelali-villa', destination: '/properties/jebel-ali-villa', permanent: true },
      { source: '/palm-jebelali-villa/:path*', destination: '/properties/jebel-ali-villa', permanent: true },
      /*
       * No magazine articles are published yet (data/news.ts), so article
       * links go to /news. Temporary: remove once real articles are added.
       */
      { source: '/magazine/:slug*', destination: '/news', permanent: false },
      /* Addresses from the old WordPress site */
      ...legacyRedirects(),
    ];
  },
  /*
   * The Wave Crest landing page is a static export in
   * public/properties/jebel-ali-villa (scripts/build-jebel-ali-villa.sh).
   * Its folder URL serves its index.html, ahead of /properties/[slug].
   */
  async rewrites() {
    return {
      beforeFiles: [{ source: '/properties/jebel-ali-villa', destination: '/properties/jebel-ali-villa/index.html' }],
    };
  },
  images: {
    /*
     * Off Vercel (Cloudflare) photos are served as they are: they are already
     * web-sized (about 100 KB), and resizing them through Cloudflare Images
     * would pass its free 5,000 a month and break.
     */
    unoptimized: !process.env.VERCEL,
    /* 85 for the listing gallery's large photos */
    qualities: [75, 85],
    remotePatterns: [
      /* Listing photos uploaded in the D|R|P admin portal (Supabase Storage, public bucket) */
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      /* Listing photos, served by Property Finder (the API may use any of its image hosts) */
      {
        protocol: 'https',
        hostname: '**.propertyfinder.ae',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.propertyfinder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
