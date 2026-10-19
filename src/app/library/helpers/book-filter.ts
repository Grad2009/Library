import { BookDraft } from '../models/book.model';

export function filterByTitle<T extends BookDraft>(books: readonly T[], query: string): T[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) {
    return [...books];
  }
  return books.filter((b) => b.title.toLocaleLowerCase().includes(needle));
}
