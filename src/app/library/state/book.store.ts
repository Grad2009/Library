import { Injectable, computed, inject, signal } from '@angular/core';
import { IdGenerator } from '../../core/services/id-generator';
import { isDuplicate } from '../helpers/book-identity';
import { filterByTitle } from '../helpers/book-filter';
import { sortBooks } from '../helpers/book-sort';
import { normalizeDraft, validateBookDraft } from '../helpers/book-validation';
import { Book, BookDraft, BookSort, DEFAULT_SORT, changedResult } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookStore {
  private readonly ids = inject(IdGenerator);

  private readonly _books = signal<Book[]>([]);
  private readonly _query = signal('');
  private readonly _sort = signal<BookSort>(DEFAULT_SORT);

  readonly books = this._books.asReadonly();
  readonly query = this._query.asReadonly();
  readonly sort = this._sort.asReadonly();

  readonly visibleBooks = computed(() =>
    sortBooks(filterByTitle(this._books(), this._query()), this._sort())
  );

  readonly totalCount = computed(() => this._books().length);

  setQuery(query: string): void {
    this._query.set(query);
  }

  setSort(sort: BookSort): void {
    this._sort.set(sort);
  }

  isDuplicate(draft: Pick<BookDraft, 'author' | 'title'>, excludeId?: string): boolean {
    return isDuplicate(draft, this._books(), excludeId);
  }

  add(draft: BookDraft): changedResult {
    const book = normalizeDraft(draft);
    if (validateBookDraft(book).length > 0) {
      return { ok: false, reason: 'invalid' };
    }
    if (this.isDuplicate(book)) {
      return { ok: false, reason: 'duplicate' };
    }
    this._books.update((books) => [...books, { id: this.ids.next(), ...book }]);
    return { ok: true };
  }

  update(id: string, draft: BookDraft): changedResult {
    if (!this._books().some((b) => b.id === id)) {
      return { ok: false, reason: 'not-found' };
    }
    const book = normalizeDraft(draft);
    if (validateBookDraft(book).length > 0) {
      return { ok: false, reason: 'invalid' };
    }
    if (this.isDuplicate(book, id)) {
      return { ok: false, reason: 'duplicate' };
    }
    this._books.update((books) => books.map((b) => (b.id === id ? { id, ...book } : b)));
    return { ok: true };
  }

  remove(id: string): changedResult {
    if (!this._books().some((b) => b.id === id)) {
      return { ok: false, reason: 'not-found' };
    }
    this._books.update((books) => books.filter((b) => b.id !== id));
    return { ok: true };
  }

  addMany(drafts: readonly BookDraft[]): void {
    if (drafts.length === 0) {
      return;
    }
    const added = drafts.map((d) => ({ id: this.ids.next(), ...normalizeDraft(d) }));
    this._books.update((books) => [...books, ...added]);
  }
}
