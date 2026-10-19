import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BookDraft } from '../models/book.model';

export const TITLE_MAX_LENGTH = 300;
export const AUTHOR_MAX_LENGTH = 200;
export const PAGES_MAX = 100000;

export interface FieldError {
  readonly field: keyof BookDraft;
  readonly message: string;
}

export function normalizeDraft(draft: BookDraft): BookDraft {
  return {
    title: draft.title.trim().replace(/\s+/g, ' '),
    author: draft.author.trim().replace(/\s+/g, ' '),
    pages: draft.pages,
  };
}

export function parsePages(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const value = Number(text);
  return value >= 1 && value <= PAGES_MAX
    ? value
    : null;
}

export function validateBookDraft(draft: BookDraft): FieldError[] {
  const errors: FieldError[] = [];

  if (!draft.title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (draft.title.length > TITLE_MAX_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must be at most ${TITLE_MAX_LENGTH} characters`,
    });
  }

  if (!draft.author) {
    errors.push({ field: 'author', message: 'Author is required' });
  } else if (draft.author.length > AUTHOR_MAX_LENGTH) {
    errors.push({
      field: 'author',
      message: `Author must be at most ${AUTHOR_MAX_LENGTH} characters`,
    });
  }

  if (!Number.isInteger(draft.pages) || draft.pages < 1 || draft.pages > PAGES_MAX) {
    errors.push({ field: 'pages', message: `Pages must be a whole number from 1 to ${PAGES_MAX}` });
  }

  return errors;
}

export function uniqueBookValidator(
  isDuplicate: (draft: Pick<BookDraft, 'author' | 'title'>) => boolean,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const title = String(group.get('title')?.value ?? '').trim();
    const author = String(group.get('author')?.value ?? '').trim();
    if (!title || !author) {
      return null;
    }
    return isDuplicate({ title, author })
      ? { duplicateBook: true }
      : null;
  };
}
