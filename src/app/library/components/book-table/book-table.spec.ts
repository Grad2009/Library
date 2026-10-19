import { ComponentFixture, TestBed } from '@angular/core/testing';
import { sortBooks } from '../../helpers/book-sort';
import { Book, BookSort, DEFAULT_SORT } from '../../models/book.model';
import { BookTable } from './book-table';

const books: Book[] = [
  { id: '1', author: 'Stephen King', title: 'It', pages: 1138 },
  { id: '2', author: 'Hans Christian Andersen', title: 'The Little Mermaid', pages: 48 },
  { id: '3', author: 'Stephen King', title: 'Carrie', pages: 199 },
  { id: '4', author: 'Hans Christian Andersen', title: 'The Ugly Duckling', pages: 32 },
];

describe('BookTable', () => {
  let fixture: ComponentFixture<BookTable>;
  let el: HTMLElement;
  let emitted: BookSort[];

  async function render(sort: BookSort = DEFAULT_SORT) {
    fixture.componentRef.setInput('sort', sort);
    fixture.componentRef.setInput('books', sortBooks(books, sort));
    fixture.componentRef.setInput('totalCount', books.length);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const authorCells = () =>
    [...el.querySelectorAll('td.author span')].map((s) =>
      s.classList.contains('cdk-visually-hidden') ? '' : s.textContent!.trim(),
    );

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [BookTable] });
    fixture = TestBed.createComponent(BookTable);
    el = fixture.nativeElement;
    emitted = [];
    fixture.componentInstance.sortChange.subscribe((s) => emitted.push(s));
    await render();
  });

  it('shows each author name once, on the first row of its group', () => {
    expect(authorCells()).toEqual(['Hans Christian Andersen', '', 'Stephen King', '']);
    expect(el.querySelectorAll('tr.group-start')).toHaveLength(2);
  });

  it('keeps hidden author names available to screen readers', () => {
    const hidden = el.querySelectorAll('td.author span.cdk-visually-hidden');
    expect([...hidden].map((s) => s.textContent!.trim())).toEqual([
      'Hans Christian Andersen',
      'Stephen King',
    ]);
  });

  it('toggles the author group order from the Author header', () => {
    el.querySelector<HTMLButtonElement>('[data-testid="author-sort"]')!.click();
    expect(emitted).toEqual([{ ...DEFAULT_SORT, authorDirection: 'desc' }]);
  });

  it('reflects the author direction in the header', async () => {
    await render({ ...DEFAULT_SORT, authorDirection: 'desc' });
    const th = el.querySelector('th.mat-column-author')!;
    expect(th.getAttribute('aria-sort')).toBe('descending');
    expect(th.textContent).toContain('arrow_downward');
  });

  it('sorts inside groups from the Title header, keeping the author direction', async () => {
    await render({ ...DEFAULT_SORT, authorDirection: 'desc' });
    el.querySelector<HTMLElement>('th.mat-column-title')!.click();
    expect(emitted).toEqual([
      { authorDirection: 'desc', within: 'title', withinDirection: 'desc' },
    ]);
  });
});
