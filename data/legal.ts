/**
 * ============================================================================
 *  LEGAL — /privacy and /terms
 * ============================================================================
 *  DEMO PLACEHOLDER – general template wording only. It must be reviewed and
 *  approved by DRP's legal advisors before launch.
 * ============================================================================
 */

import { contact, site } from './homepage';

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: { id: string; heading: string; paragraphs: string[] }[];
};

export const privacy: LegalDoc = {
  title: 'Privacy Policy',
  updated: '1 October 2026',
  intro: `This policy explains how ${site.name} ("D|R|P", "we") collects, uses and protects personal information when you use our website or our services.`,
  sections: [
    {
      id: 'information',
      heading: 'Information we collect',
      paragraphs: [
        'Details you give us, such as your name, phone or WhatsApp number, email address and information about a property or your requirements, when you complete a form, call, message or email us.',
        'Technical information collected automatically, such as your device, browser and the pages you visit, through cookies and similar technologies.',
      ],
    },
    {
      id: 'use',
      heading: 'How we use it',
      paragraphs: [
        'To respond to enquiries, arrange viewings and valuations, provide the services you ask for and keep you informed about your transaction or property.',
        'With your consent, to send market insights and property updates. You can unsubscribe at any time.',
        'To improve our website and meet our legal and regulatory obligations, including those of the Dubai Land Department and RERA.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Who we share it with',
      paragraphs: [
        'Only with parties needed to provide our services — for example developers, landlords, tenants, mortgage, legal and maintenance partners — and with authorities where the law requires it.',
        'We do not sell your personal information.',
      ],
    },
    {
      id: 'retention',
      heading: 'Storage and retention',
      paragraphs: [
        'We keep personal information only as long as needed for the purposes above or as required by law, and protect it with appropriate technical and organisational measures.',
      ],
    },
    {
      id: 'rights',
      heading: 'Your rights',
      paragraphs: [
        'Subject to applicable law, including the UAE Personal Data Protection Law, you can ask to access, correct or delete your information, or object to certain uses of it.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies',
      paragraphs: [
        'We use essential cookies to run the website and, with your consent, analytics cookies to understand how it is used. You can control cookies in your browser settings.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact us',
      paragraphs: [
        `For any privacy question or request, email ${contact.email} or write to ${contact.addressFull}.`,
      ],
    },
  ],
};

export const terms: LegalDoc = {
  title: 'Terms & Conditions',
  updated: '1 October 2026',
  intro: `These terms apply to your use of the ${site.name} website. By using the website you agree to them.`,
  sections: [
    {
      id: 'information',
      heading: 'Property information',
      paragraphs: [
        'Listings, prices, payment plans, handover dates and figures on this website are provided for information only, may change without notice and do not form part of any contract.',
        'Images may be illustrative. Always confirm details with a D|R|P advisor and through the relevant contracts before making a decision.',
      ],
    },
    {
      id: 'advice',
      heading: 'No financial advice',
      paragraphs: [
        'Market commentary, yields and calculator results are general estimates, not financial, legal or tax advice. Please take independent advice for your circumstances.',
      ],
    },
    {
      id: 'use',
      heading: 'Using the website',
      paragraphs: [
        'You agree not to misuse the website, attempt to gain unauthorised access to it, or use its content for any unlawful purpose.',
      ],
    },
    {
      id: 'ip',
      heading: 'Intellectual property',
      paragraphs: [
        'The D|R|P name, logo, text, photography and design of this website belong to D|R|P or its licensors and may not be reproduced without permission.',
      ],
    },
    {
      id: 'links',
      heading: 'Third-party links',
      paragraphs: [
        'Links to other websites, including developers and booking platforms, are provided for convenience. We are not responsible for their content or practices.',
      ],
    },
    {
      id: 'liability',
      heading: 'Liability',
      paragraphs: [
        'To the extent permitted by law, D|R|P is not liable for any loss arising from reliance on information on this website.',
      ],
    },
    {
      id: 'law',
      heading: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of the Emirate of Dubai and the federal laws of the UAE, and the Dubai courts have jurisdiction.',
      ],
    },
  ],
};
