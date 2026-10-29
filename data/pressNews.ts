/**
 * Dubai property news for /news: the articles the team picks in the D|R|P
 * portal (Website -> News) and the UAE property stories from publishers'
 * public feeds, gathered before each build by scripts/sync-news.mjs. Each is
 * a headline, a short summary and a link to the article on the publisher's
 * site.
 */
import imported from './imported/news.json';

export type PressItem = {
  url: string;
  title: string;
  summary: string;
  image: string | null;
  /** ISO date */
  date: string;
  /** The publication, e.g. "Arabian Business" */
  source: string;
  /** Picked by the team in the portal, rather than from a feed */
  pick: boolean;
};

// Read as a whole: webpack's JSON tree-shaking breaks destructuring with defaults here.
const news = imported as { picks?: PressItem[]; stories?: PressItem[] };

/** Newest first, the team's picks and the feed stories together. */
export const pressNews: PressItem[] = [...(news.picks ?? []), ...(news.stories ?? [])].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export const formatPressDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
