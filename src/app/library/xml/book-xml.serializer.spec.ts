import { BookDraft } from '../models/book.model';
import { parseBooksXml } from './book-xml.parser';
import { serializeBooksXml } from './book-xml.serializer';

const books: BookDraft[] = [
  { title: 'The Little Mermaid', author: 'Hans Christian Andersen', pages: 48 },
  { title: 'Tom & Jerry <Vol. 1> "special" \'edition\'', author: "O'Brien & Sons", pages: 12 },
  { title: 'Кобзар', author: 'Тарас Шевченко', pages: 320 },
];

describe('serializeBooksXml', () => {
  it('starts with an XML declaration', () => {
    expect(
      serializeBooksXml(books).startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<library>'),
    ).toBe(true);
  });

  it('produces pretty-printed output', () => {
    expect(serializeBooksXml([books[0]])).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<library>',
        '  <book>',
        '    <title>The Little Mermaid</title>',
        '    <author>Hans Christian Andersen</author>',
        '    <pages>48</pages>',
        '  </book>',
        '</library>',
        '',
      ].join('\n'),
    );
  });

  it('escapes special characters', () => {
    const xml = serializeBooksXml([books[1]]);
    expect(xml).toContain('Tom &amp; Jerry &lt;Vol. 1&gt;');
    expect(xml).not.toContain('<Vol. 1>');
  });

  it('produces well-formed XML', () => {
    const doc = new DOMParser().parseFromString(serializeBooksXml(books), 'application/xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  });

  it('round-trips through the parser unchanged', () => {
    expect(parseBooksXml(serializeBooksXml(books))).toEqual({ books, issues: [] });
  });

  it('serializes an empty library', () => {
    const xml = serializeBooksXml([]);
    expect(xml).toContain('<library/>');
    expect(parseBooksXml(xml)).toEqual({ books: [], issues: [] });
  });

  it('does not write ids', () => {
    const withId = [{ ...books[0], id: 'secret-id' }];
    expect(serializeBooksXml(withId)).not.toContain('secret-id');
  });
});
