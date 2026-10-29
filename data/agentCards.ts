/**
 * REAL – each agent's own contact card, the closing page of the off-plan
 * brochure they download (lib/brochurePdf.ts), with the details printed on
 * it so the rest of the brochure matches. Keyed by the name on the team.
 * Add a card as a 16:9 image in /public/agents/cards.
 */
export type AgentCard = {
  /** The card image, 1920 × 1080 */
  card: string;
  role?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
};

export const agentCards: Record<string, AgentCard> = {
  'Tara Topic': {
    card: '/agents/cards/tara-topic.webp',
    role: 'Managing Director',
    phone: '+971 50 772 0378',
    email: 'tara@dubairapidproperties.com',
  },
};
