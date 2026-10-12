/**
 * REAL – DRP's registration numbers, shown in the footer and the structured
 * data. Dubai's RERA rules expect a broker's ORN on its advertising. Leave a
 * value empty to hide it.
 */
export const licences = {
  /** RERA Office Registration Number */
  orn: '25348',
  /** Trade licence number */
  tradeLicence: '915740',
} as const;

/**
 * REAL – RERA Broker Registration Numbers, by the agent's name as it appears
 * on the team page and on Property Finder listings (spellings differ, so a
 * person can be listed more than once).
 */
export const agentBrns: Record<string, string> = {
  'Tara Topic': '77282',
  'Adithya Micheal': '95049',
  'Adithya Mitter': '95049',
  'Adithya Micheal Mitter': '95049',
  'Jasmin Miletic': '35884',
};

export const brnFor = (name: string | null | undefined) => (name ? agentBrns[name.trim()] : undefined);

/**
 * Agents' own numbers for the Call and WhatsApp buttons on their listings,
 * by the same names as agentBrns. Anyone not listed here is reached on the
 * DRP office line and the DRP WhatsApp (data/homepage.ts → contact).
 * Format: international, e.g. '+971 50 123 4567'.
 */
export const agentContacts: Record<string, { phone?: string; whatsapp?: string }> = {};

export const contactFor = (name: string | null | undefined) => (name ? agentContacts[name.trim()] : undefined);
