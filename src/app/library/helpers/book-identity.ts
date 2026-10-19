import { Book, BookDraft } from '../models/book.model';

export function normalizeText(value: string): string {
  return value.normalize().trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

  // Identity key of a book: normalized author + normalized title.
  // The NUL separator prevents "A B" + "C" colliding with "A" + "B C".
export function bookKey(book: Pick<BookDraft, 'author' | 'title'>): string {
  return `${normalizeText(book.author)}\u0000${normalizeText(book.title)}`;
}

  // True when another book in `books` has the same author + title as `draft`.
  // `excludeId` lets a book being edited not conflict with itself.
export function isDuplicate(
  draft: Pick<BookDraft, 'author' | 'title'>,
  books: readonly Book[],
  excludeId?: string,
): boolean {
  const key = bookKey(draft);
  return books.some((b) => b.id !== excludeId && bookKey(b) === key);
}
