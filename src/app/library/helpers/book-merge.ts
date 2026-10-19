import { BookDraft, DuplicateInfo } from '../models/book.model';
import { bookKey } from './book-identity';

export interface MergeResult {
  readonly toAdd: BookDraft[];
  readonly duplicates: DuplicateInfo[];
}

  // A book is skipped when its author + title is already in existing library
  // or appeared earlier in incoming file
export function mergeBooks(
  existing: readonly Pick<BookDraft, 'author' | 'title'>[],
  incoming: readonly BookDraft[],
): MergeResult {
  const libraryKeys = new Set(existing.map(bookKey));
  const seenInFile = new Set<string>();
  const toAdd: BookDraft[] = [];
  const duplicates: DuplicateInfo[] = [];

  for (const book of incoming) {
    const key = bookKey(book);
    if (libraryKeys.has(key)) {
      duplicates.push({ title: book.title, author: book.author, source: 'library' });
    } else if (seenInFile.has(key)) {
      duplicates.push({ title: book.title, author: book.author, source: 'file' });
    } else {
      seenInFile.add(key);
      toAdd.push(book);
    }
  }

  return { toAdd, duplicates };
}
