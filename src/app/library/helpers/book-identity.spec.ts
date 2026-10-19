import { Book } from '../models/book.model';
import { bookKey, isDuplicate, normalizeText } from './book-identity';

const book = (id: string, author: string, title: string): Book => ({
  id,
  author,
  title,
  pages: 10,
});

describe('normalizeText', () => {
  it('trims, collapses whitespace and lower-cases', () => {
    expect(normalizeText('  The   Little\tMERMAID ')).toBe('the little mermaid');
  });

  it('keeps accents', () => {
    expect(normalizeText('Andérsen')).not.toBe(normalizeText('Andersen'));
  });
});

describe('bookKey', () => {
  it('matches books that differ only in case and whitespace', () => {
    expect(bookKey({ author: 'Stephen King', title: 'It' })).toBe(
      bookKey({ author: '  stephen   KING ', title: ' it' }),
    );
  });

  it('does not match the same title by a different author', () => {
    expect(bookKey({ author: 'A', title: 'Poems' })).not.toBe(
      bookKey({ author: 'B', title: 'Poems' }),
    );
  });

  it('does not let author and title run together', () => {
    expect(bookKey({ author: 'A B', title: 'C' })).not.toBe(bookKey({ author: 'A', title: 'B C' }));
  });
});

describe('isDuplicate', () => {
  const library = [
    book('1', 'Stephen King', 'It'),
    book('2', 'H. C. Andersen', 'The Ugly Duckling'),
  ];

  it('finds a duplicate regardless of case', () => {
    expect(isDuplicate({ author: 'stephen king', title: 'IT' }, library)).toBe(true);
  });

  it('returns false for a new book', () => {
    expect(isDuplicate({ author: 'Stephen King', title: 'Carrie' }, library)).toBe(false);
  });

  it('lets a book match itself when its id is excluded', () => {
    expect(isDuplicate({ author: 'Stephen King', title: 'it' }, library, '1')).toBe(false);
  });

  it('still detects a clash with another book when an id is excluded', () => {
    expect(isDuplicate({ author: 'Stephen King', title: 'It' }, library, '2')).toBe(true);
  });

  it('returns false for an empty library', () => {
    expect(isDuplicate({ author: 'X', title: 'Y' }, [])).toBe(false);
  });
});
