import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ImportResult } from '../../models/book.model';

@Component({
  selector: 'app-import-summary-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './import-summary-dialog.html',
  styleUrl: './import-summary-dialog.scss',
})
export class ImportSummaryDialog {
  readonly data = inject<ImportResult>(MAT_DIALOG_DATA);
}
