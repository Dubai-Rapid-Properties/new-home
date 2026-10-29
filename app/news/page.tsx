import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import NewsExplorer from '@/components/news/NewsExplorer';
import PressFeed from '@/components/news/PressFeed';
import SectionHeading from '@/components/ui/SectionHeading';
import CtaBand from '@/components/sections/CtaBand';
import { articles } from '@/data/news';
import { pressNews } from '@/data/pressNews';
import { unsplash } from '@/lib/media';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'News & Insights | Dubai Rapid Properties',
  description:
    'Dubai real estate news from Forbes Middle East, The National, Arabian Business and more, with market reports and commentary from the D|R|P team on Palm Jumeirah.',
  path: '/news',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="News & Insights"
        heading="Stay Ahead of the Market"
        intro="The latest Dubai property news from the region's leading publications, with market reports and commentary from the D|R|P team on Palm Jumeirah."
        // DEMO PLACEHOLDER – swap for DRP photography
        image={unsplash('1526495124232-a04e1849168c', 2000)}
        imageAlt="The Downtown Dubai skyline at dusk"
      />
      {/* The team's own articles, when there are any (data/news.ts) */}
      {articles.length || !pressNews.length ? (
        <section aria-label="Articles" className="section-y bg-white">
          <div className="container-drp">
            <NewsExplorer />
          </div>
        </section>
      ) : null}
      {pressNews.length ? (
        <section aria-labelledby="press-heading" className={`section-y ${articles.length ? 'bg-cream' : 'bg-white'}`}>
          <div className="container-drp">
            <SectionHeading
              eyebrow="In the press"
              heading="Dubai Property News"
              headingId="press-heading"
              intro="Stories picked by the D|R|P team and the latest UAE property news from the region's publications. Each one opens on the publisher's site."
            />
            <div className="mt-12">
              <PressFeed items={pressNews} />
            </div>
          </div>
        </section>
      ) : null}
      <CtaBand
        eyebrow="Q3 2026 Market Report"
        heading="The full report, free"
        text="Sales, prices per sq ft, rental yields and rents by community, the luxury market and the outlook for Q4."
        button={{ label: 'Get the Report', href: '/market-report' }}
      />
    </SiteShell>
  );
}
