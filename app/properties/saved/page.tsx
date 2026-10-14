import SiteShell from '@/components/layout/SiteShell';
import SavedList from '@/components/properties/SavedList';
import SectionHeading from '@/components/ui/SectionHeading';
import { listings, toPropertyCard } from '@/data/properties';

export const metadata = {
  title: 'Saved Properties | Dubai Rapid Properties',
  robots: { index: false },
};

export default function Page() {
  return (
    <SiteShell>
      <section className="min-h-[70vh] bg-cream pb-[var(--section-y)] pt-32 lg:pt-40">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Your Shortlist"
            heading="Saved Properties"
            headingId="saved-heading"
            intro="The homes you have saved with the heart. Send the list to D|R|P and a specialist will come back to you on each one."
          />
          <SavedList cards={listings.map(toPropertyCard)} />
        </div>
      </section>
    </SiteShell>
  );
}
