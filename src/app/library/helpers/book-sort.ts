import { Book, BookDraft, BookSort, SortDirection, WithinColumn } from '../models/book.model';

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
const strictCollator = new Intl.Collator(undefined, { sensitivity: 'variant', numeric: true });

type Comparator = (a: BookDraft, b: BookDraft) => number;

const byAuthor: Comparator = (a, b) =>
  collator.compare(a.author, b.author) || strictCollator.compare(a.author, b.author);
const byTitle: Comparator = (a, b) => collator.compare(a.title, b.title);
const byPages: Comparator = (a, b) => a.pages - b.pages;

const WITHIN: Record<WithinColumn, { key: Comparator; tieBreak?: Comparator }> = {
  title: { key: byTitle },
  pages: { key: byPages, tieBreak: byTitle },
};

const directed = (result: number, direction: SortDirection) =>
  direction === 'asc' ? result : -result;

  // Compares two books: by author group first (in authorDirection), then inside the
  // group by withinDirection.
export function compareBooks(a: BookDraft, b: BookDraft, sort: BookSort): number {
  const group = byAuthor(a, b);
  if (group !== 0) return directed(group, sort.authorDirection);

  const { key, tieBreak } = WITHIN[sort.within];
  const inner = key(a, b);
  if (inner !== 0) return directed(inner, sort.withinDirection);

  return tieBreak ? tieBreak(a, b) : 0;
}

export function sortBooks<T extends BookDraft>(books: readonly T[], sort: BookSort): T[] {
  return [...books].sort((a, b) => compareBooks(a, b, sort));
}

export function toggleAuthorDirection(sort: BookSort): BookSort {
  return { ...sort, authorDirection: sort.authorDirection === 'asc' ? 'desc' : 'asc' };
}

export function setWithinSort(
  sort: BookSort,
  within: WithinColumn,
  direction: SortDirection,
): BookSort {
  return { ...sort, within, withinDirection: direction };
}

  // Ids of the books that start a new author group in an already sorted list.
  // A group is a run of books with exactly the same author text.
export function authorGroupStarts(books: readonly Book[]): ReadonlySet<string> {
  const starts = new Set<string>();
  books.forEach((book, i) => {
    if (i === 0 || books[i - 1].author !== book.author) {
      starts.add(book.id);
    }
  });
  return starts;
}
