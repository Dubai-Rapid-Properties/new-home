import { ArrowUpRight } from 'lucide-react';
import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import Reveal from '@/components/ui/Reveal';
import { contact } from '@/data/homepage';
import { ownerPortal } from '@/data/ecosystem';
import { OWNER_PORTAL_URL } from '@/data/external';
import { unsplash } from '@/lib/media';

export const metadata = { title: 'Owner Portal | Dubai Rapid Properties' };

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="For Owners"
        heading="Owner Portal"
        intro="Statements, occupancy, tenancy and maintenance for every property D|R|P manages for you — in one place."
        image={unsplash('1616486338812-3dadae4b4ace', 2000)}
        imageAlt="A bright living room in a D|R|P-managed home"
      />
      <section aria-labelledby="portal-heading" className="section-y bg-cream">
        <div className="container-drp grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="eyebrow text-orange">Inside the Portal</p>
            <h2 id="portal-heading" className="heading-display mt-5 text-[clamp(2rem,4vw,3.25rem)] text-charcoal">
              Everything about your property
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-x-10 border-t border-line sm:grid-cols-2">
              {ownerPortal.features.map((f, i) => (
                <Reveal as="li" key={f.title} delay={i * 0.04} className="border-b border-line py-6">
                  <h3 className="font-serif text-[1.35rem] text-charcoal">{f.title}</h3>
                  <p className="mt-2 text-sm font-light text-charcoal-muted">{f.text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="bg-white px-6 py-10 shadow-[0_24px_70px_-30px_rgba(26,26,26,0.18)] sm:px-10 sm:py-12">
              <p className="eyebrow text-orange">Owner Portal</p>
              <h2 className="heading-display mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] text-charcoal">Sign in</h2>
              <p className="mt-5 max-w-md font-light leading-relaxed text-charcoal-muted">
                Owners who list their property with D|R|P sign in to the owner portal with the email address registered
                with us.
              </p>
              <a
                href={OWNER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 bg-orange px-8 py-4 text-[11px] font-medium uppercase tracking-eyebrow text-white transition-colors duration-300 hover:bg-charcoal"
              >
                Sign in to the Owner Portal
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <p className="mt-8 border-t border-line pt-6 text-sm font-light text-charcoal-muted">
                No login yet? Your D|R|P account manager can set one up —{' '}
                <a href={contact.emailHref} className="link-underline text-charcoal">
                  email us
                </a>{' '}
                or call{' '}
                <a href={contact.phoneHref} className="link-underline text-charcoal">
                  {contact.phone}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
