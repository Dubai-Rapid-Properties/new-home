import Image from 'next/image';
import { MessageCircle, Phone } from 'lucide-react';
import { contact } from '@/data/homepage';
import { hasProfile, teamHref, teamMemberForAgent } from '@/data/company';
import { brnFor, contactFor } from '@/data/licences';
import SmartLink from '@/components/ui/SmartLink';
import { listingHref } from '@/data/properties';
import { siteUrl } from '@/lib/siteUrl';

const digits = (n: string) => n.replace(/[^\d]/g, '');
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

/**
 * The agent handling a listing, above its enquiry form: photo, name, role,
 * RERA BRN and Call / WhatsApp. An agent's own numbers come from
 * data/licences.ts (agentContacts); without them the buttons reach the DRP
 * office, with the WhatsApp message addressed to the agent and the listing.
 */
export default function AgentCard({
  agent,
  listingTitle,
  listingSlug,
}: {
  agent: string;
  listingTitle: string;
  listingSlug: string;
}) {
  const member = teamMemberForAgent(agent);
  const name = member?.name ?? agent;
  const role = member?.role ?? 'Property Consultant';
  const brn = member?.brn ?? brnFor(agent);
  const own = contactFor(agent) ?? contactFor(member?.name);
  /* The portal's numbers (Website → Team) first, then data/licences.ts, then the office */
  const phone = member?.phone ?? own?.phone ?? contact.phone;
  const whatsapp = member?.whatsappNumber ?? own?.whatsapp ?? own?.phone ?? contact.whatsapp;
  const message = `Hello ${name.split(' ')[0]}, I'm interested in "${listingTitle}": ${siteUrl}${listingHref(listingSlug)}`;

  return (
    <div aria-label={`Listing agent: ${name}`} role="group" className="mb-4 border border-line bg-white p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:+${digits(phone)}`}
          className="inline-flex h-11 items-center justify-center gap-2 bg-orange text-[12px] font-medium uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#e2612c]"
        >
          <Phone aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
          Call
        </a>
        <a
          href={`https://wa.me/${digits(whatsapp)}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 bg-[#25d366] text-[12px] font-medium uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#1ebe5b]"
        >
          <MessageCircle aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
          WhatsApp
        </a>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-line pt-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-cream">
          {member?.photo ? (
            <Image src={member.photo} alt={name} fill sizes="64px" className="object-cover object-top" />
          ) : (
            <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-serif text-xl text-charcoal">
              {initials(name)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          {member && hasProfile(member) ? (
            <SmartLink href={teamHref(member)} className="font-serif text-xl text-charcoal hover:text-orange">
              {name}
            </SmartLink>
          ) : (
            <p className="font-serif text-xl text-charcoal">{name}</p>
          )}
          <p className="text-[12px] font-light text-charcoal-muted">{role}</p>
          {brn ? <p className="mt-0.5 text-[12px] text-charcoal">BRN No: {brn}</p> : null}
        </div>
      </div>
    </div>
  );
}
