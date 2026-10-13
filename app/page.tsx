import ContactSection from '@/components/ContactSection';
import ExploreProperties from '@/components/ExploreProperties';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import NewsCarousel from '@/components/NewsCarousel';
import Solutions from '@/components/Solutions';
import TrustSection from '@/components/TrustSection';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import CompareTray from '@/components/properties/CompareTray';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <ExploreProperties />
        <Solutions />
        <NewsCarousel />
        <TrustSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CompareTray />
    </>
  );
}
