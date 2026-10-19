import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Book, BookDraft, changedResult, ConfirmDialogData, ImportResult} from '../models/book.model';
import {LibraryToolbar} from '../components/library-toolbar/library-toolbar';
import {BookTable} from '../components/book-table/book-table';
import {LibraryIoService} from '../state/library-io.service';
import {BookStore} from '../state/book.store';
import {ImportSummaryDialog} from '../components/import-summary-dialog/import-summary-dialog';
import {ConfirmDialog} from '../components/confirm-dialog/confirm-dialog';
import {firstValueFrom} from 'rxjs';
import {BookDialogData, BookFormDialog} from '../components/book-form-dialog/book-form-dialog';

@Component({
  imports: [LibraryToolbar, BookTable, MatProgressBarModule],
  selector: 'app-library-page',
  styleUrl: './library-page.scss',
  templateUrl: './library-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryPage {
  protected readonly store = inject(BookStore);
  private readonly io = inject(LibraryIoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly importing = signal(false);

  async importFile(file: File): Promise<void> {
    this.importing.set(true);
    let result: ImportResult;
    try {
      result = await this.io.importFile(file);
    } finally {
      this.importing.set(false);
    }

    if (result.duplicates.length === 0 && result.issues.length === 0) {
      this.notify(
        `Added ${result.added} ${result.added === 1 ? 'book' : 'books'} from ${result.fileName}`,
      );
    } else {
      this.dialog.open(ImportSummaryDialog, { data: result, width: '520px', maxWidth: '95vw' });
    }
  }

  exportLibrary(): void {
    this.io.exportLibrary();
    this.notify(`Exported ${this.store.totalCount()} books to library.xml`);
  }

  async openAdd(): Promise<void> {
    const draft = await this.openForm({
      book: null,
      isDuplicate: (d) => this.store.isDuplicate(d),
    });
    if (draft) {
      this.report(this.store.add(draft), `Added “${draft.title}”`);
    }
  }

  async openEdit(book: Book): Promise<void> {
    const draft = await this.openForm({
      book,
      isDuplicate: (d) => this.store.isDuplicate(d, book.id),
    });
    if (draft) {
      this.report(this.store.update(book.id, draft), `Saved “${draft.title}”`);
    }
  }

  async confirmRemove(book: Book): Promise<void> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete book?',
        message: `“${book.title}” by ${book.author} will be removed from the library.`,
        confirmText: 'Delete',
      },
    });
    if (await firstValueFrom(ref.afterClosed())) {
      this.report(this.store.remove(book.id), `Deleted “${book.title}”`);
    }
  }

  private openForm(data: BookDialogData): Promise<BookDraft | undefined> {
    const ref = this.dialog.open<BookFormDialog, BookDialogData, BookDraft>(BookFormDialog, {
      data,
      autoFocus: 'first-tabbable',
    });
    return firstValueFrom(ref.afterClosed());
  }

  private report(result: changedResult, success: string): void {
    if (result.ok) {
      this.notify(success);
      return;
    }
    const reasons = {
      duplicate: 'A book with this author and title already exists',
      'not-found': 'That book no longer exists',
      invalid: 'The book data is not valid',
    } as const;
    this.notify(reasons[result.reason]);
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 5000 });
  }
}

export default LibraryPage
