import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FormSection from '@/components/sections/FormSection';
import IntroSplit from '@/components/sections/IntroSplit';
import StatStrip from '@/components/sections/StatStrip';
import { contactStep, type LeadFormConfig } from '@/data/leadPages';
import { unsplash } from '@/lib/media';

export const metadata = { title: 'H1 2026 Dubai Market Report | Dubai Rapid Properties' };

const reportForm: LeadFormConfig = {
  formId: 'market-report',
  submitLabel: 'Send Me the Report',
  successTitle: 'Thank you.',
  // TODO: attach the PDF (or a download link) once the report is final
  successBody: 'The H1 2026 Market Report is on its way to your inbox.',
  steps: [
    {
      id: 'interest',
      label: 'Your Interest',
      question: 'What brings you to the report?',
      kind: 'choice',
      columns: 2,
      options: [
        { value: 'Buying', label: 'I am planning to buy' },
        { value: 'Selling', label: 'I am planning to sell' },
        { value: 'Investing', label: 'I invest in Dubai property' },
        { value: 'Research', label: 'General research' },
      ],
    },
    contactStep(
      { id: 'subscribe', label: 'Send me D|R|P market insights each month' },
      { question: 'Where should we send it?', helper: 'The report arrives by email as a PDF.' },
    ),
  ],
};

export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Market Report"
        heading="Dubai Residential Market H1 2026"
        intro="Transaction volumes, prime price movement and where the next wave of demand is forming, area by area."
        // DEMO PLACEHOLDER – swap for the report cover
        image={unsplash('1512453979798-5ea266f8880c', 2000)}
        imageAlt="An aerial view of the Dubai skyline at dusk"
      />
      <StatStrip
        items={[
          { value: '+18%', label: 'Transactions vs H1 2025' },
          { value: '54%', label: 'Off-plan share of sales' },
          { value: '+9%', label: 'Prime villa prices' },
          { value: '12', label: 'Areas analysed' },
        ]}
        note="Indicative figures. The full report has the final numbers."
      />
      <IntroSplit
        eyebrow="Inside the Report"
        heading="What the first half of 2026 tells us"
        tone="cream"
        paragraphs={[
          'Our research team combines Dubai Land Department transaction data with what our agents see on the ground every day on Palm Jumeirah and across the city.',
          'The report covers sales volumes and values, the off-plan versus ready split, prime and mid-market price movement, rental trends and yields by area, and the launches shaping supply over the next two years.',
          'It closes with our outlook for the second half of the year and what it means for buyers, sellers and landlords.',
        ]}
      />
      <FormSection
        eyebrow="Free Download"
        heading="Get the full report"
        intro="Tell us a little about yourself and we will email the report straight away."
        points={['Sales volumes and values', 'Prime and mid-market pricing', 'Rental yields by area', 'Outlook for H2 2026']}
        config={reportForm}
        tone="white"
      />
    </SiteShell>
  );
}
