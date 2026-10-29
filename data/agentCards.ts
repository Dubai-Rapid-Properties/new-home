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
  'Jasko Miletic': {
    card: '/agents/cards/jasko-miletic.webp',
    role: 'Founder & CEO',
    phone: '+971 56 777 0272',
    email: 'jasko@dubairapidproperties.com',
  },
  'Tara Topic': {
    card: '/agents/cards/tara-topic.webp',
    role: 'Managing Director',
    phone: '+971 50 772 0378',
    email: 'tara@dubairapidproperties.com',
  },
  'Adithya Micheal': {
    card: '/agents/cards/adithya-micheal.webp',
    role: 'Luxury Property Consultant',
    phone: '+971 58 527 3791',
    email: 'adithya@dubairapidproperties.com',
  },
  'Neel Mehra': {
    card: '/agents/cards/neel-mehra.webp',
    role: 'Luxury Property Consultant',
    phone: '+971 50 506 4297',
    email: 'neel@dubairapidproperties.com',
  },
  'Jason Pai': {
    card: '/agents/cards/jason-pai.webp',
    role: 'Luxury Property Consultant',
    phone: '+971 52 254 8686',
    email: 'jason@dubairapidproperties.com',
  },
};
