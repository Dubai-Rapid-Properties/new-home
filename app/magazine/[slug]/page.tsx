import Image from 'next/image';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/layout/SiteShell';
import ArticleCard from '@/components/news/ArticleCard';
import ShareLinks from '@/components/news/ShareLinks';
import CtaBand from '@/components/sections/CtaBand';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartLink from '@/components/ui/SmartLink';
import { categories, formatArticleDate, getArticle, relatedArticles } from '@/data/news';
import { staticSlugs } from './slugs';

/** Next 16: route params arrive as a Promise and must be awaited. */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const article = getArticle((await params).slug);
  return {
    title: article ? `${article.title} | D|R|P News & Insights` : 'News & Insights | Dubai Rapid Properties',
    description: article?.excerpt,
  };
}

export default async function Page({ params }: PageProps) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const categoryId = categories.find((c) => c.label === article.category)?.id;

  return (
    <SiteShell>
      <article className="bg-white pb-[var(--section-y)] pt-28 sm:pt-36">
        <header className="container-drp max-w-4xl">
          <SmartLink
            href={categoryId ? `/news?category=${categoryId}` : '/news'}
            className="eyebrow text-orange hover:text-orange-600"
          >
            {article.category}
          </SmartLink>
          <h1 className="heading-display mt-5 text-[clamp(2.2rem,5vw,4rem)] text-charcoal">{article.title}</h1>
          <p className="mt-6 max-w-2xl text-[17px] font-light leading-relaxed text-charcoal-light">{article.excerpt}</p>
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-[11px] uppercase tracking-eyebrow text-charcoal-muted">
            <span>{article.author}</span>
            <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
            <span>{article.readMinutes} min read</span>
          </p>
        </header>

        <div className="container-drp mt-10 sm:mt-14">
          <div className="relative aspect-[16/9] overflow-hidden bg-line">
            <Image src={article.image} alt={article.alt} fill priority sizes="(max-width: 1320px) 100vw, 90vw" className="object-cover" />
          </div>
        </div>

        <div className="container-drp mt-12 max-w-3xl sm:mt-16">
          {article.body.map((section, i) => (
            <section key={i} className={i ? 'mt-12' : ''}>
              {section.heading ? (
                <h2 className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] font-light leading-snug text-charcoal">
                  {section.heading}
                </h2>
              ) : null}
              <div className={`space-y-5 ${section.heading ? 'mt-5' : ''}`}>
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className={`font-light leading-[1.8] text-charcoal-light ${i === 0 && j === 0 ? 'text-[18px]' : 'text-[16px]'}`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
          <div className="mt-14 border-t border-line pt-8">
            <ShareLinks title={article.title} />
          </div>
        </div>
      </article>

      <section aria-labelledby="related-heading" className="section-y bg-cream">
        <div className="container-drp">
          <SectionHeading eyebrow="Keep Reading" heading="Related Articles" headingId="related-heading" />
          <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {relatedArticles(article).map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        eyebrow="Talk It Through"
        heading="Questions about the market?"
        button={{ label: 'Speak With a Specialist', href: '/contact' }}
        whatsappText={`Hello D|R|P, I read "${article.title}" and have a question.`}
      />
    </SiteShell>
  );
}
