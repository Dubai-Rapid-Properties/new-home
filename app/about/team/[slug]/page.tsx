import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import SiteShell from '@/components/layout/SiteShell';
import PropertyCard from '@/components/PropertyCard';
import FormSection from '@/components/sections/FormSection';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartLink from '@/components/ui/SmartLink';
import { getTeamMember, managementMessage, memberContact, team, teamHref, teamMemberForAgent } from '@/data/company';
import { contactStep, type LeadFormConfig } from '@/data/leadPages';
import { listings, toPropertyCard } from '@/data/properties';

/** Next 16: route params arrive as a Promise and must be awaited. */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return team.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const member = getTeamMember((await params).slug);
  return {
    title: member ? `${member.name}, ${member.role} | Dubai Rapid Properties` : 'Our Team | Dubai Rapid Properties',
    description: member?.bio[0],
  };
}

const actionClass =
  'inline-flex h-12 items-center gap-2.5 border px-6 text-[11px] font-medium uppercase tracking-eyebrow transition-colors duration-300';

export default async function Page({ params }: PageProps) {
  const member = getTeamMember((await params).slug);
  if (!member) notFound();

  const firstName = member.name.split(' ')[0];
  const reach = memberContact(member);
  const theirListings = listings.filter((l) => teamMemberForAgent(l.agent)?.slug === member.slug);
  const message = managementMessage.memberSlug === member.slug ? managementMessage : null;
  const colleagues = team.filter((m) => m.slug !== member.slug);

  const enquiryForm: LeadFormConfig = {
    formId: 'team-enquiry',
    submitLabel: 'Send Message',
    successTitle: 'Thank you.',
    successBody: `Your message is on its way to ${firstName}, who will reply personally.`,
    steps: [
      contactStep(undefined, {
        question: `Send ${firstName} a message`,
        helper: `${firstName} will reply personally. We never share your details.`,
        message: { label: 'Message' },
      }),
    ],
  };

  return (
    <SiteShell>
      <section className="bg-white pb-[var(--section-y)] pt-24 lg:pt-28">
        <div className="container-drp">
          <nav aria-label="Breadcrumb" className="py-5 text-[11px] uppercase tracking-eyebrow text-charcoal-muted sm:py-6">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <SmartLink href="/about" className="hover:text-orange">About</SmartLink>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <SmartLink href="/about#team" className="hover:text-orange">Team</SmartLink>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-charcoal">{member.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-line">
                <Image
                  src={member.photo}
                  alt={`${member.name}, ${member.role}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-[50%_18%]"
                />
              </div>
            </Reveal>

            <div className="lg:col-span-7 lg:pt-6">
              <p className="eyebrow text-orange">{member.role}</p>
              <h1 className="heading-display mt-4 text-[clamp(2.4rem,5vw,4rem)] text-charcoal">{member.name}</h1>
              {member.brn ? (
                <p className="mt-3 text-[11px] uppercase tracking-eyebrow text-charcoal-muted">RERA BRN {member.brn}</p>
              ) : null}

              <div className="mt-8 max-w-[62ch] space-y-5">
                {member.bio.length ? (
                  member.bio.map((p, i) => (
                    <p key={i} className="text-[15px] font-light leading-relaxed text-charcoal-light sm:text-base">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-[15px] font-light leading-relaxed text-charcoal-light sm:text-base">
                    {firstName} is part of the DRP team at our office on Golden Mile 9, Palm Jumeirah.
                  </p>
                )}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={`${reach.whatsappHref}?text=${encodeURIComponent(
                    reach.personal ? `Hello ${firstName},` : `Hello DRP, I would like to speak to ${member.name}.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${actionClass} border-orange bg-orange text-white hover:bg-orange/90`}
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                  WhatsApp {firstName}
                </a>
                <a
                  href={`${reach.emailHref}?subject=${encodeURIComponent(`For the attention of ${member.name}`)}`}
                  className={`${actionClass} border-charcoal/20 text-charcoal hover:border-charcoal`}
                >
                  <Mail aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                  Email
                </a>
                <a href={reach.phoneHref} className={`${actionClass} border-charcoal/20 text-charcoal hover:border-charcoal`}>
                  <Phone aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
                  {reach.phone}
                </a>
              </div>
              {reach.personal ? null : (
                <p className="mt-4 text-xs font-light text-charcoal-muted">
                  Messages go to the DRP office and are passed straight to {firstName}.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <section aria-labelledby="message-heading" className="section-y bg-ink text-white">
          <div className="container-drp grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading eyebrow="DRP" heading={message.heading} headingId="message-heading" tone="light" />
              <blockquote className="mt-8 space-y-5 border-l border-orange pl-6 sm:pl-8">
                {message.paragraphs.map((p, i) => (
                  <p key={i} className="font-serif text-[clamp(1.3rem,2.2vw,1.65rem)] font-light leading-snug text-white/90">
                    {p}
                  </p>
                ))}
                <footer className="pt-2 text-[11px] uppercase tracking-eyebrow text-white/50">
                  {member.name}, {member.role}
                </footer>
              </blockquote>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                <Image src={message.image} alt={message.imageAlt} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-[50%_20%]" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {theirListings.length ? (
        <section aria-labelledby="listings-heading" className="section-y bg-cream">
          <div className="container-drp">
            <SectionHeading
              eyebrow={`${theirListings.length} ${theirListings.length === 1 ? 'Property' : 'Properties'}`}
              heading={`Listed by ${firstName}`}
              headingId="listings-heading"
            />
            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {theirListings.map((l, i) => (
                <Reveal as="li" key={l.slug} delay={(i % 3) * 0.08}>
                  <PropertyCard {...toPropertyCard(l)} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <FormSection
        eyebrow={`Contact ${firstName}`}
        heading={`Get in touch with ${firstName}`}
        intro={`Tell ${firstName} what you are looking for and you will hear back personally.`}
        config={enquiryForm}
        context={{ teamMember: member.name }}
        tone={theirListings.length ? 'white' : 'cream'}
      />

      <section aria-labelledby="colleagues-heading" className={`section-y ${theirListings.length ? 'bg-cream' : 'bg-white'}`}>
        <div className="container-drp">
          <SectionHeading eyebrow="Meet the Team" heading="The People Behind DRP" headingId="colleagues-heading" />
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6">
            {colleagues.map((m) => (
              <li key={m.slug}>
                <SmartLink href={teamHref(m)} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-line">
                    <Image
                      src={m.photo}
                      alt={`${m.name}, ${m.role}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover object-[50%_18%] transition-transform duration-[900ms] ease-premium group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="mt-3 font-serif text-lg leading-tight text-charcoal transition-colors duration-300 group-hover:text-orange">
                    {m.name}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-eyebrow text-charcoal-muted">{m.role}</p>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
