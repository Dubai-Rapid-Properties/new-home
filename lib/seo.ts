import type { Metadata } from 'next';
import { site } from '@/data/homepage';

type PageMeta = {
  title: string;
  description: string;
  /** The page's own address, e.g. '/properties'. Becomes the canonical URL and og:url. */
  path: string;
  /** Share image; pages without one use the site-wide app/opengraph-image.jpg. */
  image?: string;
  /** Keep the page out of search results (pages that only show the visitor's own data). */
  noindex?: boolean;
};

/**
 * A page's search and share metadata: its own description, a canonical
 * address, and Open Graph / X cards that match. Without it, a page inherits
 * the root layout's description and share card, so search engines and
 * social previews see the same text for every page.
 */
export function pageMeta({ title, description, path, image, noindex }: PageMeta): Metadata {
  /* A page's own openGraph replaces the root's, so the site-wide image is set here too */
  const images = [image ?? '/opengraph-image.jpg'];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      locale: 'en_AE',
      siteName: site.name,
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

/** Shortens text to a search-result-sized description, at a word boundary. */
export function clip(text: string, max = 155): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s—–-]+$/, '')}…`;
}
