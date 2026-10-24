import PageHero from '@/components/PageHero';
import NewsletterSignup from '@/components/NewsletterSignup';
import SiteShell from '@/components/layout/SiteShell';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'D|R|P Magazine | Coming Soon | Dubai Rapid Properties',
  description:
    'D|R|P Magazine is coming soon: Dubai property stories, market insight and investor guides from the team at Dubai Rapid Properties.',
  path: '/magazine',
});

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="D|R|P Magazine"
        heading="Coming Soon"
        intro="Dubai property stories, market insight and investor guides, written by the team behind Dubai Rapid Properties."
        image="/images/office-night.webp"
        imageAlt="The D|R|P office on Palm Jumeirah at night"
      />
      <section aria-labelledby="magazine-signup" className="section-y bg-ink text-white">
        <div className="container-drp grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="eyebrow text-orange">Be the first to read</p>
            <h2 id="magazine-signup" className="heading-display mt-4 text-[clamp(1.8rem,4vw,3rem)]">
              Our first issue is on its way
            </h2>
            <p className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-white/70">
              Leave your email and we will send you the magazine, along with new listings and market notes, as soon
              as it is published.
            </p>
          </div>
          <div className="lg:col-span-5">
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
