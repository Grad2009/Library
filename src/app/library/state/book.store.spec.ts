import { TestBed } from '@angular/core/testing';
import { IdGenerator } from '../../core/services/id-generator';
import { BookStore } from './book.store';

class SequentialIds extends IdGenerator {
  private n = 0;
  override next(): string {
    return `id-${++this.n}`;
  }
}

describe('BookStore', () => {
  let store: BookStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: IdGenerator, useClass: SequentialIds }],
    });
    store = TestBed.inject(BookStore);
  });

  it('starts empty, grouped by author ascending with titles ascending', () => {
    expect(store.books()).toEqual([]);
    expect(store.sort()).toEqual({
      authorDirection: 'asc',
      within: 'title',
      withinDirection: 'asc',
    });
  });

  describe('add', () => {
    it('adds a normalized book with a generated id', () => {
      expect(store.add({ title: ' It ', author: 'Stephen  King', pages: 1138 })).toEqual({
        ok: true,
      });
      expect(store.books()).toEqual([
        { id: 'id-1', title: 'It', author: 'Stephen King', pages: 1138 },
      ]);
    });

    it('refuses a duplicate author + title', () => {
      store.add({ title: 'It', author: 'Stephen King', pages: 1 });
      expect(store.add({ title: 'IT', author: 'stephen king', pages: 2 })).toEqual({
        ok: false,
        reason: 'duplicate',
      });
      expect(store.books()).toHaveLength(1);
    });

    it('allows the same title by another author', () => {
      store.add({ title: 'Poems', author: 'A', pages: 1 });
      expect(store.add({ title: 'Poems', author: 'B', pages: 1 })).toEqual({ ok: true });
    });

    it('refuses invalid data', () => {
      expect(store.add({ title: '', author: 'X', pages: 1 })).toEqual({
        ok: false,
        reason: 'invalid',
      });
      expect(store.add({ title: 'X', author: 'X', pages: 0 })).toEqual({
        ok: false,
        reason: 'invalid',
      });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      store.add({ title: 'It', author: 'Stephen King', pages: 1138 });
      store.add({ title: 'Carrie', author: 'Stephen King', pages: 199 });
    });

    it('updates a book by id', () => {
      expect(store.update('id-2', { title: 'Carrie', author: 'Stephen King', pages: 200 })).toEqual(
        { ok: true },
      );
      expect(store.books()[1]).toEqual({
        id: 'id-2',
        title: 'Carrie',
        author: 'Stephen King',
        pages: 200,
      });
    });

    it('allows saving a book with its own values, or a case change', () => {
      expect(store.update('id-1', { title: 'IT', author: 'Stephen King', pages: 1138 })).toEqual({
        ok: true,
      });
    });

    it('refuses turning a book into a duplicate of another', () => {
      expect(store.update('id-2', { title: 'it', author: 'Stephen King', pages: 1 })).toEqual({
        ok: false,
        reason: 'duplicate',
      });
      expect(store.books()[1].title).toBe('Carrie');
    });

    it('reports an unknown id', () => {
      expect(store.update('nope', { title: 'X', author: 'Y', pages: 1 })).toEqual({
        ok: false,
        reason: 'not-found',
      });
    });

    it('refuses invalid data', () => {
      expect(store.update('id-1', { title: 'It', author: '', pages: 1 })).toEqual({
        ok: false,
        reason: 'invalid',
      });
    });
  });

  describe('remove', () => {
    it('removes a book by id', () => {
      store.add({ title: 'It', author: 'Stephen King', pages: 1 });
      expect(store.remove('id-1')).toEqual({ ok: true });
      expect(store.books()).toEqual([]);
    });

    it('reports an unknown id', () => {
      expect(store.remove('nope')).toEqual({ ok: false, reason: 'not-found' });
    });
  });

  describe('visibleBooks', () => {
    beforeEach(() => {
      store.addMany([
        { title: 'It', author: 'Stephen King', pages: 1138 },
        { title: 'The Ugly Duckling', author: 'Hans Christian Andersen', pages: 32 },
        { title: 'The Little Mermaid', author: 'Hans Christian Andersen', pages: 48 },
        { title: 'The Shining', author: 'Stephen King', pages: 447 },
      ]);
    });

    it('is sorted by author, then title by default', () => {
      expect(store.visibleBooks().map((b) => b.title)).toEqual([
        'The Little Mermaid',
        'The Ugly Duckling',
        'It',
        'The Shining',
      ]);
    });

    it('applies the title filter', () => {
      store.setQuery('the');
      expect(store.visibleBooks().map((b) => b.title)).toEqual([
        'The Little Mermaid',
        'The Ugly Duckling',
        'The Shining',
      ]);
    });

    it('follows sort changes, keeping author groups together', () => {
      store.setSort({ authorDirection: 'desc', within: 'pages', withinDirection: 'desc' });
      expect(store.visibleBooks().map((b) => b.pages)).toEqual([1138, 447, 48, 32]);
      store.setSort({ authorDirection: 'asc', within: 'pages', withinDirection: 'desc' });
      expect(store.visibleBooks().map((b) => b.pages)).toEqual([48, 32, 1138, 447]);
    });

    it('updates after an edit moves a book to another author', () => {
      store.update('id-3', { title: 'The Little Mermaid', author: 'Zz Author', pages: 48 });
      expect(store.visibleBooks().at(-1)?.author).toBe('Zz Author');
    });

    it('keeps the full list in books() while filtered', () => {
      store.setQuery('zzz');
      expect(store.visibleBooks()).toEqual([]);
      expect(store.totalCount()).toBe(4);
    });
  });
});
