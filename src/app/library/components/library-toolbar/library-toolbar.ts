import {ChangeDetectionStrategy, Component, debounced, input, output} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-library-toolbar',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './library-toolbar.html',
  styleUrl: './library-toolbar.scss',
})
export class LibraryToolbar {
  readonly query = input('');
  readonly canExport = input(false);

  readonly queryChange = output<string>();
  readonly importFile = output<File>();
  readonly exportClick = output<void>();
  readonly addClick = output<void>();

  onFile(inputEl: HTMLInputElement): void {
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (file) {
      this.importFile.emit(file);
    }
  }
}
