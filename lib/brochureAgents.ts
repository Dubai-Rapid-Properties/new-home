/**
 * Who a brochure can be presented by (D|R|P's team, with each agent's own
 * contact card where they have one) and the office details on its last page.
 * Shared by the off-plan and property pages' agent brochures.
 */
import type { BrochureAgent, BrochureOffice } from '@/lib/brochurePdf';
import { agentCards } from '@/data/agentCards';
import { allTeam, memberContact } from '@/data/company';
import { contact } from '@/data/homepage';
import { licences } from '@/data/licences';
import { siteUrl } from '@/lib/siteUrl';

export function brochureAgents(): BrochureAgent[] {
  return allTeam.map((m) => {
    const c = memberContact(m);
    /* The agent's own contact card, and the details printed on it */
    const card = agentCards[m.name];
    return {
      name: m.name,
      role: card?.role ?? m.role,
      phone: card?.phone ?? c.phone,
      whatsapp: card?.whatsapp ?? m.whatsappNumber ?? contact.whatsapp,
      email: card?.email ?? m.emailAddress ?? contact.email,
      brn: m.brn ?? '',
      photo: m.photo || undefined,
      card: card?.card,
    };
  });
}

export const brochureOffice = (): BrochureOffice => ({
  phone: contact.phone,
  email: contact.email,
  address: contact.addressFull,
  orn: licences.orn,
  website: siteUrl.replace(/^https?:\/\//, ''),
});
