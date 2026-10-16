import LegalDocument from '@/components/legal/LegalDocument';
import { privacy } from '@/data/legal';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Privacy Policy | Dubai Rapid Properties',
  description:
    'How Dubai Rapid Properties collects, uses and protects your personal data.',
  path: '/privacy',
});

export default function Page() {
  return <LegalDocument doc={privacy} other={{ label: 'Terms & Conditions', href: '/terms' }} />;
}
