import GuidePage from '@/components/guides/GuidePage';
import { goldenVisa as guide } from '@/data/guides';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...guide.meta, path: '/golden-visa' });

export default function Page() {
  return <GuidePage guide={guide} />;
}
