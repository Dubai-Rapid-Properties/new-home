import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FormSection from '@/components/sections/FormSection';
import IntroSplit from '@/components/sections/IntroSplit';
import StatStrip from '@/components/sections/StatStrip';
import { contactStep, type LeadFormConfig } from '@/data/leadPages';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Q3 2026 Dubai Residential Market Report | Dubai Rapid Properties',
  description:
    'Dubai’s residential market from July to September 2026: AED 73.9bn of sales, prices per sq ft and rental yields by community, the luxury market and the outlook for Q4.',
  path: '/market-report',
});

const reportForm: LeadFormConfig = {
  formId: 'market-report',
  submitLabel: 'Send Me the Report',
  successTitle: 'Thank you.',
  successBody: 'The Q3 2026 Market Report is on its way to your inbox.',
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
      { question: 'Where should we send it?', helper: 'You will get a link to the report as a PDF.' },
    ),
  ],
};

/* REAL – the headline figures of the PDF (Property Monitor, from Dubai Land Department transactions) */
export default function Page() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Market Report · Q3 2026"
        heading="Dubai Residential Market Report"
        intro="July to September 2026: sales, prices and rents across Dubai, community by community, with our outlook for the final quarter."
        image="/images/market-report-q3-2026.webp"
        imageAlt="The Dubai skyline at sunset from the Dubai Creek Harbour bridge"
      />
      <StatStrip
        items={[
          { value: 'AED 73.9bn', label: 'Residential sales value' },
          { value: '33,969', label: 'Homes sold' },
          { value: '71.7%', label: 'Off-plan share of sales' },
          { value: '6.3%', label: 'Average gross rental yield' },
        ]}
        note="Source: Property Monitor (Dubai Land Department transaction data), July to September 2026."
      />
      <IntroSplit
        eyebrow="Inside the Report"
        heading="What the summer quarter tells us"
        tone="cream"
        paragraphs={[
          'Almost 34,000 homes changed hands in Q3, worth AED 73.9 billion. The ready market came back: completed-home sales rose by almost 15% on the previous quarter, as buyers looked for homes they can move into or rent out straight away.',
          'Off-plan still makes up most sales, but buyers are more selective, comparing developers, delivery records, pricing and payment plans. Two-thirds chose studios or one-bedroom homes, and 782 homes sold for more than AED 10 million.',
          'The report covers price per sq ft and rental yields by community, the top sales of the quarter, 173,076 leases and average rents, mortgages, and what we expect from Q4.',
        ]}
      />
      <FormSection
        eyebrow="Free Download"
        heading="Get the full report"
        intro="Tell us a little about yourself and we will email the report straight away."
        points={[
          'Sales by month, price bracket and size',
          'Price per sq ft by community',
          'Rental yields and rents by community',
          'The luxury market and the outlook for Q4',
        ]}
        config={reportForm}
        tone="white"
      />
    </SiteShell>
  );
}
