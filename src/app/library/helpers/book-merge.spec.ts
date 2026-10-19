import { mergeBooks } from './book-merge';

const b = (author: string, title: string, pages = 10) => ({ author, title, pages });

describe('mergeBooks', () => {
  it('adds books that are not in the library', () => {
    const result = mergeBooks([b('King', 'It')], [b('King', 'Carrie')]);
    expect(result.toAdd).toEqual([b('King', 'Carrie')]);
    expect(result.duplicates).toEqual([]);
  });

  it('skips books already in the library', () => {
    const result = mergeBooks([b('King', 'It')], [b('king', ' IT ')]);
    expect(result.toAdd).toEqual([]);
    expect(result.duplicates).toEqual([{ author: 'king', title: ' IT ', source: 'library' }]);
  });

  it('skips repeats inside the file, keeping the first', () => {
    const result = mergeBooks([], [b('King', 'It', 1), b('King', 'It', 2)]);
    expect(result.toAdd).toEqual([b('King', 'It', 1)]);
    expect(result.duplicates).toEqual([{ author: 'King', title: 'It', source: 'file' }]);
  });

  it('adds the same title by different authors', () => {
    const result = mergeBooks([b('Abe', 'Poems')], [b('Zed', 'Poems'), b('Mo', 'Poems')]);
    expect(result.toAdd).toHaveLength(2);
    expect(result.duplicates).toEqual([]);
  });

  it('reports a book that is both in the library and repeated in the file as library duplicates', () => {
    const result = mergeBooks([b('King', 'It')], [b('King', 'It'), b('King', 'It')]);
    expect(result.duplicates.map((d) => d.source)).toEqual(['library', 'library']);
  });

  it('handles an empty file', () => {
    expect(mergeBooks([b('King', 'It')], [])).toEqual({ toAdd: [], duplicates: [] });
  });

  it('does not mutate its inputs', () => {
    const existing = [b('King', 'It')];
    const incoming = [b('King', 'It'), b('King', 'Carrie')];
    const snapshot = JSON.stringify([existing, incoming]);
    mergeBooks(existing, incoming);
    expect(JSON.stringify([existing, incoming])).toBe(snapshot);
  });
});
