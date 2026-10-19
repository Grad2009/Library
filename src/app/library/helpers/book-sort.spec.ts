import { Book, BookDraft, BookSort, DEFAULT_SORT } from '../models/book.model';
import {
  authorGroupStarts,
  compareBooks,
  setWithinSort,
  sortBooks,
  toggleAuthorDirection,
} from './book-sort';

const b = (author: string, title: string, pages = 100): BookDraft => ({ author, title, pages });
const list = (books: BookDraft[]) => books.map((x) => `${x.author}: ${x.title}`);

const sort = (overrides: Partial<BookSort> = {}): BookSort => ({ ...DEFAULT_SORT, ...overrides });

const library = [
  b('King', 'It', 1138),
  b('Andersen', 'The Ugly Duckling', 32),
  b('King', 'Carrie', 199),
  b('Andersen', 'The Little Mermaid', 48),
  b('King', 'The Shining', 447),
];

describe('sortBooks', () => {
  it('matches the task example by default: authors A→Z, titles A→Z inside each author', () => {
    expect(list(sortBooks(library, DEFAULT_SORT))).toEqual([
      'Andersen: The Little Mermaid',
      'Andersen: The Ugly Duckling',
      'King: Carrie',
      'King: It',
      'King: The Shining',
    ]);
  });

  it('reverses the author groups and keeps titles ascending inside them', () => {
    expect(list(sortBooks(library, sort({ authorDirection: 'desc' })))).toEqual([
      'King: Carrie',
      'King: It',
      'King: The Shining',
      'Andersen: The Little Mermaid',
      'Andersen: The Ugly Duckling',
    ]);
  });

  it('sorts titles descending inside groups without breaking the groups', () => {
    expect(list(sortBooks(library, sort({ withinDirection: 'desc' })))).toEqual([
      'Andersen: The Ugly Duckling',
      'Andersen: The Little Mermaid',
      'King: The Shining',
      'King: It',
      'King: Carrie',
    ]);
  });

  it('combines descending groups with descending titles', () => {
    expect(
      list(sortBooks(library, sort({ authorDirection: 'desc', withinDirection: 'desc' }))),
    ).toEqual([
      'King: The Shining',
      'King: It',
      'King: Carrie',
      'Andersen: The Ugly Duckling',
      'Andersen: The Little Mermaid',
    ]);
  });

  it('sorts by pages inside each group', () => {
    const pages = (s: BookSort) => sortBooks(library, s).map((x) => `${x.author[0]}${x.pages}`);
    expect(pages(sort({ within: 'pages' }))).toEqual(['A32', 'A48', 'K199', 'K447', 'K1138']);
    expect(pages(sort({ within: 'pages', withinDirection: 'desc' }))).toEqual([
      'A48',
      'A32',
      'K1138',
      'K447',
      'K199',
    ]);
  });

  it('never lets a page sort mix authors, even when page counts interleave', () => {
    const books = [b('B', 'x', 1), b('A', 'y', 500), b('B', 'z', 900), b('A', 'w', 2)];
    expect(list(sortBooks(books, sort({ within: 'pages' })))).toEqual([
      'A: w',
      'A: y',
      'B: x',
      'B: z',
    ]);
  });

  it('breaks equal page counts by title, ascending in both directions', () => {
    const books = [b('A', 'Zeta', 10), b('A', 'Alpha', 10)];
    expect(list(sortBooks(books, sort({ within: 'pages', withinDirection: 'desc' })))).toEqual([
      'A: Alpha',
      'A: Zeta',
    ]);
  });

  it('orders authors case-insensitively', () => {
    const books = [b('king', 'x'), b('Andersen', 'x'), b('Zola', 'x')];
    expect(sortBooks(books, DEFAULT_SORT).map((x) => x.author)).toEqual([
      'Andersen',
      'king',
      'Zola',
    ]);
  });

  it('keeps author spellings that differ only in case as separate, adjacent groups', () => {
    const books = [b('King', 'b'), b('KING', 'a'), b('Andersen', 'x'), b('King', 'a')];
    const authors = sortBooks(books, DEFAULT_SORT).map((x) => x.author);
    expect(authors[0]).toBe('Andersen');
    // Each spelling forms one contiguous run.
    expect(authors.slice(1).join(',')).toMatch(/^(King,King,KING|KING,King,King)$/);
  });

  it('orders numbers inside text naturally', () => {
    const books = [b('A', 'Vol 10'), b('A', 'Vol 2'), b('A', 'Vol 1')];
    expect(sortBooks(books, DEFAULT_SORT).map((x) => x.title)).toEqual([
      'Vol 1',
      'Vol 2',
      'Vol 10',
    ]);
  });

  it('places accented letters next to their base letter', () => {
    const books = [b('Zola', 'x'), b('Éluard', 'x'), b('Dumas', 'x')];
    expect(sortBooks(books, DEFAULT_SORT).map((x) => x.author)).toEqual([
      'Dumas',
      'Éluard',
      'Zola',
    ]);
  });

  it('does not mutate the input', () => {
    const books = [b('B', 'x'), b('A', 'x')];
    const copy = [...books];
    sortBooks(books, DEFAULT_SORT);
    expect(books).toEqual(copy);
  });

  it('handles an empty list', () => {
    expect(sortBooks([], DEFAULT_SORT)).toEqual([]);
  });
});

describe('compareBooks', () => {
  it('returns 0 for books equal on all keys', () => {
    expect(compareBooks(b('A', 'x'), b('A', 'X'), DEFAULT_SORT)).toBe(0);
  });
});

describe('toggleAuthorDirection', () => {
  it('flips only the author direction', () => {
    const s = sort({ within: 'pages', withinDirection: 'desc' });
    expect(toggleAuthorDirection(s)).toEqual({ ...s, authorDirection: 'desc' });
    expect(toggleAuthorDirection(toggleAuthorDirection(s))).toEqual(s);
  });
});

describe('setWithinSort', () => {
  it('changes the inner column and direction, keeping the author direction', () => {
    const s = sort({ authorDirection: 'desc' });
    expect(setWithinSort(s, 'pages', 'desc')).toEqual({
      authorDirection: 'desc',
      within: 'pages',
      withinDirection: 'desc',
    });
  });
});

describe('authorGroupStarts', () => {
  const book = (id: string, author: string): Book => ({ id, author, title: id, pages: 1 });

  it('marks the first book of each author run', () => {
    const books = [book('1', 'A'), book('2', 'A'), book('3', 'B'), book('4', 'C'), book('5', 'C')];
    expect([...authorGroupStarts(books)]).toEqual(['1', '3', '4']);
  });

  it('treats different spellings as different groups', () => {
    expect([...authorGroupStarts([book('1', 'King'), book('2', 'KING')])]).toEqual(['1', '2']);
  });

  it('returns an empty set for an empty list', () => {
    expect(authorGroupStarts([]).size).toBe(0);
  });
});
