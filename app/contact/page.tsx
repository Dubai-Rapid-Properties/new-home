import ContactSection from '@/components/ContactSection';
import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import ArrowLink from '@/components/ui/ArrowLink';
import SectionHeading from '@/components/ui/SectionHeading';
import { contactPage } from '@/data/company';
import { contact } from '@/data/homepage';

export const metadata = { title: 'Contact D|R|P | Dubai Rapid Properties' };

export default function Page() {
  const routes = [
    { label: 'Call', value: contact.phone, href: contact.phoneHref },
    { label: 'WhatsApp', value: contact.whatsapp, href: contact.whatsappHref, external: true },
    { label: 'Email', value: contact.email, href: contact.emailHref },
  ];

  return (
    <SiteShell>
      <PageHero {...contactPage.hero} />

      {/* A white band separates the dark hero from the dark contact section,
          with a short orange rule at its centre */}
      <div aria-hidden="true" className="flex h-10 items-center justify-center bg-white lg:h-14">
        <span className="h-px w-16 bg-orange lg:w-24" />
      </div>

      <ContactSection />

      <section aria-labelledby="office-heading" className="section-y bg-cream">
        <div className="container-drp grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Our Office" heading="Visit D|R|P" headingId="office-heading" />
            <address className="mt-8 text-[15px] font-light not-italic leading-relaxed text-charcoal">
              {contact.addressFull}
            </address>
            <dl className="mt-10 border-t border-line">
              {contactPage.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-6 border-b border-line py-4 text-[15px] font-light">
                  <dt className="text-charcoal-muted">{h.days}</dt>
                  <dd className="text-charcoal">{h.time}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-10 space-y-4">
              {routes.map((r) => (
                <li key={r.label} className="flex items-baseline justify-between gap-6 text-[15px] font-light">
                  <span className="text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{r.label}</span>
                  <a
                    href={r.href}
                    {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="text-charcoal transition-colors duration-300 hover:text-orange"
                  >
                    {r.value}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ArrowLink href={contactPage.mapLink} label="Open in Google Maps" external />
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden bg-line">
              <iframe
                src={contactPage.mapEmbed}
                title="Map showing the D|R|P office on Golden Mile 9, Palm Jumeirah"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 grayscale-[30%]"
              />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
