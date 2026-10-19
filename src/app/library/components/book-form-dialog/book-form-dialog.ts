import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { startWith } from 'rxjs';
import {
  AUTHOR_MAX_LENGTH,
  PAGES_MAX,
  TITLE_MAX_LENGTH,
  normalizeDraft,
  uniqueBookValidator,
} from '../../helpers/book-validation';
import { Book, BookDraft } from '../../models/book.model';

export interface BookDialogData {
  book: Book | null;
  isDuplicate: (draft: Pick<BookDraft, 'author' | 'title'>) => boolean;
}

const notBlank = (c: AbstractControl): ValidationErrors | null =>
  String(c.value ?? '').trim() ? null : { required: true };

const wholeNumber = (c: AbstractControl): ValidationErrors | null =>
  c.value === null || c.value === '' || Number.isInteger(Number(c.value))
    ? null
    : { wholeNumber: true };

@Component({
  selector: 'app-book-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-form-dialog.html',
  styleUrl: './book-form-dialog.scss',
})
export class BookFormDialog {
  readonly data = inject<BookDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<BookFormDialog, BookDraft>>(MatDialogRef);

  readonly isEdit = this.data.book !== null;
  readonly limits = {
    title: TITLE_MAX_LENGTH,
    author: AUTHOR_MAX_LENGTH,
    pages: PAGES_MAX,
  };

  readonly form = inject(FormBuilder).nonNullable.group(
    {
      title: [this.data.book?.title ?? '', [notBlank, Validators.maxLength(TITLE_MAX_LENGTH)]],
      author: [this.data.book?.author ?? '', [notBlank, Validators.maxLength(AUTHOR_MAX_LENGTH)]],
      pages: [
        this.data.book?.pages ?? null,
        [Validators.required, Validators.min(1), Validators.max(PAGES_MAX), wholeNumber],
      ],
    },
    { validators: uniqueBookValidator(this.data.isDuplicate) },
  );

  private readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)), {
    requireSync: true,
  });

  readonly isDuplicate = computed(() => {
    this.formValue();
    return this.form.hasError('duplicateBook');
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, author, pages } = this.form.getRawValue();
    this.dialogRef.close(normalizeDraft({ title, author, pages: Number(pages) }));
  }
}
