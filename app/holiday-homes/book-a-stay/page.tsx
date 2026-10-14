import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import StayFinder from '@/components/holiday/StayFinder';
import FeatureGrid from '@/components/sections/FeatureGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import { unsplash } from '@/lib/media';

export const metadata = { title: 'Book a Stay | D|R|P Holiday Homes' };

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Holiday Homes"
        heading="Book a Stay"
        intro="Serviced holiday homes across Palm Jumeirah, Dubai Marina, JBR and Downtown, looked after by a local D|R|P team."
        image={unsplash('1564013799919-ab600027ffc6', 2000)}
        imageAlt="A sunlit holiday home terrace with sea views"
      />
      <section aria-labelledby="stays-heading" className="section-y bg-cream">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Our Homes"
            heading="Choose Your Home"
            headingId="stays-heading"
            intro="Rates shown are from-prices per night. Send an enquiry and we confirm availability and the exact rate for your dates."
          />
          <div className="mt-12">
            <StayFinder />
          </div>
        </div>
      </section>
      <FeatureGrid
        eyebrow="Every Stay Includes"
        heading="Hotel Standards, Home Comforts"
        items={[
          { title: 'Self check-in', text: 'Arrive when you like with smart-lock or concierge check-in.' },
          { title: 'Housekeeping', text: 'Hotel-standard linen, towels and a full clean before you arrive.' },
          { title: 'Local team', text: 'A D|R|P guest team on call 24 hours a day.' },
          { title: 'Airport transfers', text: 'Arranged on request, with the D|R|P car fleet.' },
          { title: 'Longer stays', text: 'Weekly and monthly rates for stays of seven nights or more.' },
          { title: 'Licensed homes', text: 'Every home is registered for short-stay rental in Dubai.' },
        ]}
      />
    </SiteShell>
  );
}
