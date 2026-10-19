import { filterByTitle } from './book-filter';

const books = [
  { title: 'The Little Mermaid', author: 'Andersen', pages: 48 },
  { title: 'The Ugly Duckling', author: 'Andersen', pages: 32 },
  { title: 'It', author: 'King', pages: 1138 },
];

describe('filterByTitle', () => {
  it('matches part of a title', () => {
    expect(filterByTitle(books, 'duck').map((b) => b.title)).toEqual(['The Ugly Duckling']);
  });

  it('is case-insensitive', () => {
    expect(filterByTitle(books, 'MERMAID')).toHaveLength(1);
  });

  it('trims the query', () => {
    expect(filterByTitle(books, '  the ')).toHaveLength(2);
  });

  it('matches titles only, not authors', () => {
    expect(filterByTitle(books, 'King')).toEqual([]);
  });

  it.each(['', '   '])('returns all books for query %j', (query) => {
    expect(filterByTitle(books, query)).toEqual(books);
  });

  it('returns a new array', () => {
    expect(filterByTitle(books, '')).not.toBe(books);
  });
});
