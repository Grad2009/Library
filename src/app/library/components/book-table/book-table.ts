import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { authorGroupStarts, setWithinSort, toggleAuthorDirection } from '../../helpers/book-sort';
import { Book, BookSort, WithinColumn } from '../../models/book.model';

const WITHIN_COLUMNS: readonly WithinColumn[] = ['title', 'pages'];

@Component({
  selector: 'app-book-table',
  imports: [MatTableModule, MatSortModule, MatButtonModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-table.html',
  styleUrl: './book-table.scss',
})
export class BookTable {
  readonly books = input.required<Book[]>();
  readonly sort = input.required<BookSort>();
  readonly totalCount = input(0);
  readonly query = input('');

  readonly sortChange = output<BookSort>();
  readonly edit = output<Book>();
  readonly remove = output<Book>();

  readonly columns = ['author', 'title', 'pages', 'actions'];
  readonly trackById = (_: number, book: Book) => book.id;

  readonly groupStarts = computed(() => authorGroupStarts(this.books()));

  readonly authorAriaSort = computed(() =>
    this.sort().authorDirection === 'asc' ? 'ascending' : 'descending',
  );

  onAuthorClick(): void {
    this.sortChange.emit(toggleAuthorDirection(this.sort()));
  }

  onWithinSortChange(event: Sort): void {
    const column = event.active as WithinColumn;
    if (!WITHIN_COLUMNS.includes(column)) {
      return;
    }
    const direction = event.direction === 'desc' ? 'desc' : 'asc';
    this.sortChange.emit(setWithinSort(this.sort(), column, direction));
  }
}
