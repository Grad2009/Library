import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookDraft } from '../../models/book.model';
import { BookDialogData, BookFormDialog } from './book-form-dialog';

describe('BookFormDialog', () => {
  const close = vi.fn();
  const existing = { author: 'Stephen King', title: 'It' };
  const isDuplicate = (d: Pick<BookDraft, 'author' | 'title'>) =>
    d.author.toLowerCase() === existing.author.toLowerCase() &&
    d.title.toLowerCase() === existing.title.toLowerCase();

  async function setup(data: BookDialogData) {
    close.mockReset();
    TestBed.configureTestingModule({
      imports: [BookFormDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(BookFormDialog);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const type = async (name: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(`input[formcontrolname="${name}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const save = () => el.querySelector<HTMLButtonElement>('[data-testid="save"]')!;
    const warning = () => el.querySelector('[data-testid="duplicate-warning"]');
    return { fixture, el, type, save, warning };
  }

  it('closes with a normalized draft when saving a valid new book', async () => {
    const { type, save } = await setup({ book: null, isDuplicate });
    await type('title', '  Carrie ');
    await type('author', 'Stephen   King');
    await type('pages', '199');
    save().click();
    expect(close).toHaveBeenCalledWith({ title: 'Carrie', author: 'Stephen King', pages: 199 });
  });

  it('shows a warning and disables Save for a duplicate', async () => {
    const { type, save, warning } = await setup({ book: null, isDuplicate });
    await type('title', 'it');
    await type('author', 'stephen king');
    await type('pages', '10');
    expect(warning()?.textContent).toContain('already exists');
    expect(save().disabled).toBe(true);
  });

  it('removes the warning once the title is changed', async () => {
    const { type, save, warning } = await setup({ book: null, isDuplicate });
    await type('title', 'It');
    await type('author', 'Stephen King');
    await type('title', 'It 2');
    expect(warning()).toBeNull();
    expect(save().disabled).toBe(false);
  });

  it('does not close when required fields are missing', async () => {
    const { type, save } = await setup({ book: null, isDuplicate });
    await type('title', '   ');
    save().click();
    expect(close).not.toHaveBeenCalled();
  });

  it('rejects a fractional page count', async () => {
    const { type, save } = await setup({ book: null, isDuplicate });
    await type('title', 'X');
    await type('author', 'Y');
    await type('pages', '3.5');
    save().click();
    expect(close).not.toHaveBeenCalled();
  });

  it('allows saving an unchanged book in edit mode', async () => {
    const book = { id: '1', title: 'It', author: 'Stephen King', pages: 1138 };
    const { save, warning, el } = await setup({ book, isDuplicate: () => false });
    expect(el.querySelector('h2')?.textContent).toContain('Edit book');
    expect(warning()).toBeNull();
    save().click();
    expect(close).toHaveBeenCalledWith({ title: 'It', author: 'Stephen King', pages: 1138 });
  });
});
