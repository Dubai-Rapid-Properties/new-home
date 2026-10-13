import SiteShell from '@/components/layout/SiteShell';
import CompareTable, { type CompareListing } from '@/components/properties/CompareTable';
import SectionHeading from '@/components/ui/SectionHeading';
import { bedsLabel, listingHref, listings } from '@/data/properties';

export const metadata = {
  title: 'Compare Properties | Dubai Rapid Properties',
  robots: { index: false },
};

export default function Page() {
  const rows: CompareListing[] = listings.map((l) => ({
    slug: l.slug,
    href: l.href ?? listingHref(l.slug),
    title: l.title,
    image: l.images[0].src,
    offering: l.offering,
    price: l.price,
    size: l.size,
    type: l.type,
    beds: bedsLabel(l.beds),
    baths: l.baths,
    area: l.area,
    building: l.building,
    completion: l.completion,
    furnishing: l.furnishing,
    permit: l.permit,
  }));
  return (
    <SiteShell>
      <section className="min-h-[70vh] bg-cream pb-[var(--section-y)] pt-32 lg:pt-40">
        <div className="container-drp">
          <SectionHeading
            eyebrow="Side by Side"
            heading="Compare Properties"
            headingId="compare-heading"
            intro="Up to three properties, feature by feature. Your picks stay in this browser."
          />
          <CompareTable listings={rows} />
        </div>
      </section>
    </SiteShell>
  );
}
