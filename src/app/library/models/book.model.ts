export interface Book {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly pages: number;
}

export type BookDraft = Omit<Book, 'id'>;

export type SortDirection = 'asc' | 'desc';

export type WithinColumn = 'title' | 'pages';

  // 2-level sort: books are always grouped by author
  // authorDirection orders the groups, within + withinDirection order books inside a group
export interface BookSort {
  readonly authorDirection: SortDirection;
  readonly within: WithinColumn;
  readonly withinDirection: SortDirection;
}

export const DEFAULT_SORT: BookSort = {
  authorDirection: 'asc',
  within: 'title',
  withinDirection: 'asc',
};

export interface ParseIssue {
  readonly recordIndex: number | null;
  readonly field?: keyof BookDraft;
  readonly message: string;
}

export interface ParseResult {
  readonly books: BookDraft[];
  readonly issues: ParseIssue[];
}

export interface DuplicateInfo {
  readonly title: string;
  readonly author: string;
  readonly source: 'file' | 'library';
}

export interface ImportResult {
  readonly fileName: string;
  readonly added: number;
  readonly duplicates: DuplicateInfo[];
  readonly issues: ParseIssue[];
}

export type changedResult =
  | { ok: true }
  | { ok: false; reason: 'duplicate' | 'not-found' | 'invalid' };

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
}
