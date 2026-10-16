import GuidePage from '@/components/guides/GuidePage';
import { buyingGuide as guide } from '@/data/guides';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...guide.meta, path: '/buying-guide' });

export default function Page() {
  return <GuidePage guide={guide} />;
}
