import LegalDocument from '@/components/legal/LegalDocument';
import { terms } from '@/data/legal';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Terms & Conditions | Dubai Rapid Properties',
  description:
    'The terms and conditions for using the Dubai Rapid Properties website.',
  path: '/terms',
});

export default function Page() {
  return <LegalDocument doc={terms} other={{ label: 'Privacy Policy', href: '/privacy' }} />;
}
