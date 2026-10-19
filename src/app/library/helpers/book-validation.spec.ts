import { FormControl, FormGroup } from '@angular/forms';
import {
  AUTHOR_MAX_LENGTH,
  PAGES_MAX,
  TITLE_MAX_LENGTH,
  normalizeDraft,
  parsePages,
  uniqueBookValidator,
  validateBookDraft,
} from './book-validation';

const valid = { title: 'It', author: 'Stephen King', pages: 1138 };

describe('normalizeDraft', () => {
  it('trims and collapses whitespace in text fields', () => {
    expect(
      normalizeDraft({ title: '  The  Shining ', author: ' Stephen\nKing ', pages: 5 }),
    ).toEqual({
      title: 'The Shining',
      author: 'Stephen King',
      pages: 5,
    });
  });
});

describe('parsePages', () => {
  it.each([
    ['48', 48],
    [' 48 ', 48],
    ['1', 1],
    [String(PAGES_MAX), PAGES_MAX],
  ])('accepts %j', (raw, expected) => {
    expect(parsePages(raw)).toBe(expected);
  });

  it.each(['', 'abc', '3.5', '-5', '0', '48 pages', '1e3', String(PAGES_MAX + 1)])(
    'rejects %j',
    (raw) => {
      expect(parsePages(raw)).toBeNull();
    },
  );
});

describe('validateBookDraft', () => {
  it('accepts a valid book', () => {
    expect(validateBookDraft(valid)).toEqual([]);
  });

  it('requires a title and an author', () => {
    const fields = validateBookDraft({ ...valid, title: '', author: '' }).map((e) => e.field);
    expect(fields).toEqual(['title', 'author']);
  });

  it('limits text lengths', () => {
    const fields = validateBookDraft({
      ...valid,
      title: 'x'.repeat(TITLE_MAX_LENGTH + 1),
      author: 'x'.repeat(AUTHOR_MAX_LENGTH + 1),
    }).map((e) => e.field);
    expect(fields).toEqual(['title', 'author']);
  });

  it.each([0, -1, 3.5, Number.NaN, PAGES_MAX + 1])('rejects pages = %s', (pages) => {
    expect(validateBookDraft({ ...valid, pages }).map((e) => e.field)).toEqual(['pages']);
  });
});

describe('uniqueBookValidator', () => {
  const makeGroup = (isDup: boolean) =>
    new FormGroup(
      { title: new FormControl('It'), author: new FormControl('Stephen King') },
      { validators: uniqueBookValidator(() => isDup) },
    );

  it('sets duplicateBook when the check reports a duplicate', () => {
    expect(makeGroup(true).errors).toEqual({ duplicateBook: true });
  });

  it('passes when the check reports no duplicate', () => {
    expect(makeGroup(false).errors).toBeNull();
  });

  it('skips the check while title or author is empty', () => {
    const check = vi.fn(() => true);
    const group = new FormGroup(
      { title: new FormControl(''), author: new FormControl('Stephen King') },
      { validators: uniqueBookValidator(check) },
    );
    expect(group.errors).toBeNull();
    expect(check).not.toHaveBeenCalled();
  });

  it('passes trimmed values to the check', () => {
    const check = vi.fn(() => false);
    new FormGroup(
      { title: new FormControl('  It '), author: new FormControl(' Stephen King') },
      { validators: uniqueBookValidator(check) },
    );
    expect(check).toHaveBeenCalledWith({ title: 'It', author: 'Stephen King' });
  });
});
