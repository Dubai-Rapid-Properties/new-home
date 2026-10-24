import PageHero from '@/components/PageHero';
import SiteShell from '@/components/layout/SiteShell';
import FormSection from '@/components/sections/FormSection';
import IntroSplit from '@/components/sections/IntroSplit';
import StatStrip from '@/components/sections/StatStrip';
import { contactStep, type LeadFormConfig } from '@/data/leadPages';
import { dubaiMarket } from '@/lib/dld';
import { unsplash } from '@/lib/media';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'H1 2026 Dubai Market Report | Dubai Rapid Properties',
  description:
    'Dubai’s residential market in H1 2026: transaction volumes, prime price movement and where the next wave of demand is forming, area by area.',
  path: '/market-report',
});

/* The same figures as the PDF (scripts/build-market-report.py): January to June from the DLD data */
const h1 = dubaiMarket.months.filter((m) => m.month <= '2026-06');
const h1Sales = h1.reduce((n, m) => n + m.sales, 0);
const h1Psf = Math.round(h1.reduce((n, m) => n + m.sales * (m.medianPsf ?? 0), 0) / h1Sales);

const reportForm: LeadFormConfig = {
  formId: 'market-report',
  submitLabel: 'Send Me the Report',
  successTitle: 'Thank you.',
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
      { question: 'Where should we send it?', helper: 'You will get a link to the report as a PDF.' },
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
          { value: h1Sales.toLocaleString('en-US'), label: 'Registered sales, Jan to Jun' },
          { value: `AED ${h1Psf.toLocaleString('en-US')}`, label: 'Average median price per sq ft' },
          { value: `${Math.round((dubaiMarket.offPlanShare ?? 0) * 100)}%`, label: 'Off-plan share of 2026 sales' },
          { value: '15', label: 'Areas ranked' },
        ]}
        note="From Dubai Land Department registered sales. The report has the full tables."
      />
      <IntroSplit
        eyebrow="Inside the Report"
        heading="What the first half of 2026 tells us"
        tone="cream"
        paragraphs={[
          'The report is built from the Dubai Land Department’s registered residential sales, checked against what our agents see on the ground every day on Palm Jumeirah and across the city.',
          'It covers sales by month, the areas with the most transactions and what each costs per sq ft, the off-plan share, and a closer look at Palm Jumeirah, building by building.',
          'It closes with what July to September added, so you can see how the market has moved since the half-year.',
        ]}
      />
      <FormSection
        eyebrow="Free Download"
        heading="Get the full report"
        intro="Tell us a little about yourself and we will email the report straight away."
        points={['Sales volumes by month', 'Price per sq ft by area', 'Palm Jumeirah, building by building', 'What July to September added']}
        config={reportForm}
        tone="white"
      />
    </SiteShell>
  );
}
