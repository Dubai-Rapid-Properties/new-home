import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import CtaBand from '@/components/sections/CtaBand';
import FaqList from '@/components/sections/FaqList';
import ImageText from '@/components/sections/ImageText';
import ProcessSteps from '@/components/sections/ProcessSteps';
import StatStrip from '@/components/sections/StatStrip';
import { holidayHomes as page } from '@/data/services';

export const metadata = { title: 'Holiday Homes | Dubai Rapid Properties' };

export default function Page() {
  return (
    <SiteShell>
      <PageHero {...page.hero} />
      {/* DEMO PLACEHOLDER figures — replace with portfolio data */}
      <StatStrip items={page.stats} note="Indicative figures across the D|R|P holiday-home portfolio." />
      <ImageText
        {...page.guests}
        imageAlt={page.guests.imageAlt}
        tone="cream"
        link={{ label: 'Book a stay', href: '/holiday-homes/book-a-stay' }}
      />
      <ImageText
        {...page.owners}
        imageAlt={page.owners.imageAlt}
        reverse
        link={{ label: 'List your holiday home', href: '/holiday-homes/list-your-property' }}
      />
      <ProcessSteps eyebrow="For Owners" heading="From Keys to Income" steps={page.ownerSteps} tone="dark" />
      <FaqList items={page.faqs} />
      <CtaBand
        eyebrow="Holiday Homes"
        heading="Talk to our holiday homes team"
        button={{ label: 'Get an Earnings Estimate', href: '/holiday-homes/list-your-property' }}
        whatsappText="Hello D|R|P, I would like to know more about D|R|P Holiday Homes."
      />
    </SiteShell>
  );
}
