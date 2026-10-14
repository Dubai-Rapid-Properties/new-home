/**
 * ============================================================================
 *  LEAD-GENERATION PAGES — /list-your-property and /property-valuation
 * ============================================================================
 *  Copy, hero images and the multi-step form config for both pages. Each form
 *  is a plain `steps` array rendered by components/LeadForm.tsx, so steps can
 *  be added, removed or reordered here without touching the component.
 * ============================================================================
 */

import { searchData } from './homepage';

/** Helper so Unsplash URLs stay readable and consistently sized. */
const unsplash = (id: string, w = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/* -------------------------------------------------------------------------- */
/*  FORM CONFIG TYPES                                                         */
/* -------------------------------------------------------------------------- */

export type LeadOption = { value: string; label: string };

type StepBase = {
  /** Key the answer is stored under in the submitted payload. */
  id: string;
  /** Short name shown beside the progress bar. */
  label: string;
  question: string;
  helper?: string;
};

export type LeadStep =
  /** Large tappable option cards. Picking one moves straight to the next step. */
  | (StepBase & { kind: 'choice'; options: LeadOption[]; columns?: 2 | 3 })
  /** Type-to-filter dropdown. */
  | (StepBase & { kind: 'search'; options: string[]; placeholder: string })
  /** Single free-text field. `optional` adds a Skip action. */
  | (StepBase & { kind: 'text'; placeholder: string; optional?: boolean })
  /** Name, Phone / WhatsApp and Email, plus an optional consent-style checkbox. */
  | (StepBase & {
      kind: 'contact';
      checkbox?: { id: string; label: string };
      /** Adds a free-text message field under the contact details. */
      message?: { label: string; optional?: boolean };
    });

export type LeadFormConfig = {
  /** Identifies the form in the submitted payload. */
  formId: string;
  steps: LeadStep[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
};

/* -------------------------------------------------------------------------- */
/*  SHARED STEPS                                                              */
/* -------------------------------------------------------------------------- */

const propertyTypeStep: LeadStep = {
  id: 'propertyType',
  label: 'Property Type',
  question: 'What type of property is it?',
  kind: 'choice',
  columns: 2,
  options: ['Apartment', 'Villa', 'Townhouse', 'Other'].map((o) => ({ value: o, label: o })),
};

const areaStep: LeadStep = {
  id: 'area',
  label: 'Area',
  question: 'Where is the property?',
  kind: 'search',
  placeholder: 'Search Dubai areas',
  options: searchData.locations,
};

const buildingStep: LeadStep = {
  id: 'building',
  label: 'Building / Community',
  question: 'Which building or community?',
  helper: 'Optional. It helps our specialist prepare before calling you.',
  kind: 'text',
  placeholder: 'e.g. Golden Mile 9, Shoreline Apartments',
  optional: true,
};

const bedroomsStep: LeadStep = {
  id: 'bedrooms',
  label: 'Bedrooms',
  question: 'How many bedrooms?',
  kind: 'choice',
  columns: 3,
  options: searchData.beds.map((b) => ({
    value: b,
    label: b === 'Studio' ? 'Studio' : b === '1' ? '1 Bedroom' : `${b} Bedrooms`,
  })),
};

export const contactStep = (
  checkbox?: { id: string; label: string },
  extra: Partial<Pick<StepBase, 'question' | 'helper'>> & {
    message?: { label: string; optional?: boolean };
  } = {},
): LeadStep => ({
  id: 'contact',
  label: 'Your Details',
  question: extra.question ?? 'How can we reach you?',
  helper: 'A D|R|P specialist will contact you personally. We never share your details.',
  kind: 'contact',
  checkbox,
  message: extra.message,
  ...(extra.helper ? { helper: extra.helper } : {}),
});

/* -------------------------------------------------------------------------- */
/*  PAGE 1 — LIST YOUR PROPERTY                                               */
/* -------------------------------------------------------------------------- */

export const listYourProperty = {
  metaTitle: 'List Your Property with D|R|P | Dubai Rapid Properties',
  hero: {
    eyebrow: 'List with D|R|P',
    heading: 'List Your Property with D|R|P',
    intro:
      'Whether you are looking to sell or rent your property, our team will help you position it correctly, reach qualified clients and manage the process from listing to completion.',
    subline:
      'Tell us a little about your property and one of our specialists will contact you.',
    // DEMO PLACEHOLDER – swap for a DRP shoot of a Dubai residential building
    image: '/images/luxu.png',
    imageAlt: 'A residential tower in Dubai',
  },
  form: {
    formId: 'list-your-property',
    submitLabel: 'List My Property',
    successTitle: 'Thank you.',
    successBody: 'A D|R|P property specialist will contact you shortly.',
    steps: [
      {
        id: 'intent',
        label: 'Sell or Rent',
        question: 'What would you like to do?',
        kind: 'choice',
        columns: 2,
        options: [
          { value: 'Sell', label: 'Sell' },
          { value: 'Rent', label: 'Rent' },
        ],
      },
      propertyTypeStep,
      areaStep,
      buildingStep,
      bedroomsStep,
      contactStep(),
    ],
  } satisfies LeadFormConfig,
  strip: [
    { index: '01', label: 'Since 2007' },
    { index: '02', label: 'Palm Jumeirah Based' },
    { index: '03', label: 'Full Property Ecosystem' },
  ],
};

/* -------------------------------------------------------------------------- */
/*  PAGE 2 — PROPERTY VALUATION                                               */
/* -------------------------------------------------------------------------- */

export const propertyValuation = {
  metaTitle: 'Property Valuation | Dubai Rapid Properties',
  hero: {
    eyebrow: 'Property Valuation',
    heading: 'Know What Your Property Is Worth',
    intro:
      'Understanding the correct market value is the first step towards a successful sale or rental.',
    // DEMO PLACEHOLDER – swap for a DRP shoot of a Dubai residential building
    image: '/images/val.jpg',
    imageAlt: 'A contemporary Dubai residential building against a clear sky',
  },
  process: {
    heading: 'What a D|R|P specialist does',
    points: [
      'Arrange a visit to the property',
      'Assess its condition and characteristics',
      'Review current market conditions and comparable transactions',
      'Provide an assessment of achievable market value',
    ],
  },
  form: {
    formId: 'property-valuation',
    submitLabel: 'Request a Valuation',
    successTitle: 'Thank you.',
    successBody: 'A D|R|P valuation specialist will contact you shortly.',
    steps: [
      areaStep,
      buildingStep,
      propertyTypeStep,
      bedroomsStep,
      contactStep({ id: 'arrangeVisit', label: 'I would like to arrange a property visit' }),
    ],
  } satisfies LeadFormConfig,
};
