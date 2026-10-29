/**
 * ============================================================================
 *  PROPERTY CALCULATORS — /calculators
 * ============================================================================
 *  Dubai purchase costs and rental-yield assumptions. They are estimates of
 *  the standard fees; DRP confirms the exact figures for each purchase.
 * ============================================================================
 */

export const buyingCosts = {
  defaultPrice: 2_500_000,
  /** Dubai Land Department transfer fee, % of price */
  dldPct: 4,
  /** Title deed fee */
  titleDeedAed: 580,
  /** Registration trustee office fee, by price, plus VAT */
  trusteeAed: (price: number) => (price >= 500_000 ? 4_000 : 2_000),
  /** Buyer's agency fee, % of price, plus VAT: always paid on a resale, cash or mortgage (not on developer sales) */
  agencyPct: 2,
  vatPct: 5,
  /** With a mortgage */
  defaultDownPct: 25,
  mortgageRegPct: 0.25,
  mortgageRegAdminAed: 290,
  valuationAed: 3_000,
  /** Bank arrangement fee, % of the loan, plus VAT */
  arrangementPct: 1,
};

export const rentalYield = {
  defaultPrice: 2_500_000,
  defaultRent: 180_000,
  defaultSize: 1_200,
  /** Annual service charge, AED per sq ft */
  defaultServiceCharge: 18,
  /** Annual maintenance allowance, % of rent */
  defaultMaintenancePct: 5,
  /** Property management fee, % of rent */
  defaultManagementPct: 5,
  /** Purchase costs added to the price for the net yield, % */
  purchaseCostPct: 7,
};

export const calculatorsPage = {
  hero: {
    eyebrow: 'Property Calculators',
    heading: 'Run the Numbers',
    intro: 'What a Dubai purchase costs on top of the price, and what a home earns once it is let.',
    image: '/images/market.webp',
    imageAlt: 'The Dubai skyline at dusk',
  },
  faqs: [
    {
      q: 'Who pays the 4% DLD transfer fee?',
      a: 'In Dubai the buyer pays it by market convention, at transfer. On off-plan purchases it is paid to register the sale with the Land Department (Oqood), and some developers cover all or part of it as an incentive.',
    },
    {
      q: 'Is there property tax or capital gains tax in Dubai?',
      a: 'There is no annual property tax and no tax on capital gains or rental income for individuals. Owners pay the building service charge, and tenants pay a housing fee through their utility bill.',
    },
    {
      q: 'What is a good rental yield in Dubai?',
      a: 'Gross yields across Dubai commonly run between about 5% and 8%, higher for apartments in established communities and lower for prime villas. The net figure, after service charges and costs, is the one to compare.',
    },
    {
      q: 'How accurate are these figures?',
      a: 'They use the standard fees and your own inputs, so they are estimates. Your D|R|P specialist confirms the exact costs, service charge and achievable rent for any property you are considering.',
    },
  ],
};
