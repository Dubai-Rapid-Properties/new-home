import { getCollection, latestLaunches, projects, toCard } from '@/data/offPlan';
import SectionHeading from '../ui/SectionHeading';
import ProjectGrid, { type DefaultSort } from './ProjectGrid';

export type { DefaultSort };

/** The projects a page lists: the latest launches or one collection (by slug). */
const listFor = (source: string) => (source === 'latest-launches' ? latestLaunches : (getCollection(source)?.projects ?? []));

type Props = {
  /** "latest-launches" or a collection slug. Without it: every project, with the search query string applied. */
  source?: string;
  defaultSort?: DefaultSort;
  /** Tags every card NEW LAUNCH */
  isNew?: boolean;
  eyebrow: string;
  heading: string;
  intro?: string;
};

/**
 * Filterable off-plan project grid. Without `source` it lists every project and
 * reads the search URL. Only each project's card details reach the browser.
 */
export default function ProjectExplorer({ source, defaultSort = 'newest', isNew, eyebrow, heading, intro }: Props) {
  const items = (source ? listFor(source) : projects).map(toCard);
  return (
    <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-16 bg-cream pb-[var(--section-y)]">
      <div className="container-drp pb-10 pt-[var(--section-y)] sm:pb-12">
        <SectionHeading eyebrow={eyebrow} heading={heading} headingId="projects-heading" intro={intro} />
      </div>
      <ProjectGrid items={items} defaultSort={defaultSort} isNew={isNew} searchable={!source} />
    </section>
  );
}
