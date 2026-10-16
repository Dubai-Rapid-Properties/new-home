import GuidePage from '@/components/guides/GuidePage';
import { sellingGuide as guide } from '@/data/guides';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...guide.meta, path: '/selling-guide' });

export default function Page() {
  return <GuidePage guide={guide} />;
}
