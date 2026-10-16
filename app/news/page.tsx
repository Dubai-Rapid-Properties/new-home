import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import NewsExplorer from '@/components/news/NewsExplorer';
import CtaBand from '@/components/sections/CtaBand';
import { unsplash } from '@/lib/media';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'News & Insights | Dubai Rapid Properties',
  description:
    'Market reports, launch coverage and investment commentary on Dubai real estate from the D|R|P team on Palm Jumeirah.',
  path: '/news',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="News & Insights"
        heading="Stay Ahead of the Market"
        intro="Market reports, launch coverage and investment commentary from the D|R|P team on Palm Jumeirah."
        // DEMO PLACEHOLDER – swap for DRP photography
        image={unsplash('1526495124232-a04e1849168c', 2000)}
        imageAlt="The Downtown Dubai skyline at dusk"
      />
      <section aria-label="Articles" className="section-y bg-white">
        <div className="container-drp">
          <NewsExplorer />
        </div>
      </section>
      <CtaBand
        eyebrow="H1 2026 Market Report"
        heading="The full report, free"
        text="Transaction volumes, prime price movement and area-by-area outlook."
        button={{ label: 'Get the Report', href: '/market-report' }}
      />
    </SiteShell>
  );
}
