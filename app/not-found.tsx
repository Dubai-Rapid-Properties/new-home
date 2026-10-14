import SiteShell from '@/components/layout/SiteShell';
import PageHero from '@/components/PageHero';
import ArrowLink from '@/components/ui/ArrowLink';

export const metadata = { title: 'Page Not Found | Dubai Rapid Properties' };

const links = [
  { href: '/properties', label: 'Properties for Sale and Rent' },
  { href: '/off-plan', label: 'Off-Plan Projects' },
  { href: '/areas', label: 'Area Guides' },
  { href: '/contact', label: 'Contact D|R|P' },
];

export default function NotFound() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Page Not Found"
        heading="This page has moved"
        intro="The page you were looking for is no longer here. The property may have sold, or the address may have changed with our new website."
        image="/images/palmjumeirah.webp"
        imageAlt="Palm Jumeirah at sunset"
      />
      <section className="bg-cream py-[var(--section-y)]">
        <div className="container-drp">
          <p className="text-[11px] uppercase tracking-eyebrow text-charcoal-muted">Where to next</p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((l) => (
              <li key={l.href}>
                <ArrowLink href={l.href} label={l.label} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
