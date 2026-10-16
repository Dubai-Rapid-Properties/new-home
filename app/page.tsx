import ContactSection from '@/components/ContactSection';
import ExploreProperties from '@/components/ExploreProperties';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import NewsCarousel from '@/components/NewsCarousel';
import Solutions from '@/components/Solutions';
import TrustSection from '@/components/TrustSection';
import { news } from '@/data/homepage';
import { pageMeta } from '@/lib/seo';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import CompareTray from '@/components/properties/CompareTray';

export const metadata = pageMeta({
  title: 'Dubai Rapid Properties | Dubai Real Estate. Global Perspective.',
  description:
    'Dubai real estate agency on Palm Jumeirah since 2007: ready and off-plan property for sale and rent, holiday homes, property management and furnishing.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <ExploreProperties />
        <Solutions />
        {news.articles.length > 0 && <NewsCarousel />}
        <TrustSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CompareTray />
    </>
  );
}
