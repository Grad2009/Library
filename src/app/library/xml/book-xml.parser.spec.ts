import { parseBooksXml } from './book-xml.parser';

const lib = (inner: string) => `<?xml version="1.0" encoding="UTF-8"?><library>${inner}</library>`;
const book = (title: string, author: string, pages: string) =>
  `<book><title>${title}</title><author>${author}</author><pages>${pages}</pages></book>`;

describe('parseBooksXml', () => {
  it('parses a valid file', () => {
    const result = parseBooksXml(
      lib(
        book('The Little Mermaid', 'Hans Christian Andersen', '48') +
          book('It', 'Stephen King', '1138'),
      ),
    );
    expect(result.issues).toEqual([]);
    expect(result.books).toEqual([
      { title: 'The Little Mermaid', author: 'Hans Christian Andersen', pages: 48 },
      { title: 'It', author: 'Stephen King', pages: 1138 },
    ]);
  });

  it('parses pretty-printed XML and trims values', () => {
    const xml = `<library>
      <book>
        <title>
          The   Shining
        </title>
        <author> Stephen King </author>
        <pages> 447 </pages>
      </book>
    </library>`;
    expect(parseBooksXml(xml)).toEqual({
      books: [{ title: 'The Shining', author: 'Stephen King', pages: 447 }],
      issues: [],
    });
  });

  it('accepts an empty library', () => {
    expect(parseBooksXml('<library/>')).toEqual({ books: [], issues: [] });
  });

  it('decodes entities and CDATA', () => {
    const result = parseBooksXml(
      lib(book('Tom &amp; Jerry &lt;1&gt;', "<![CDATA[O'Brien & Co]]>", '12')),
    );
    expect(result.books).toEqual([{ title: 'Tom & Jerry <1>', author: "O'Brien & Co", pages: 12 }]);
  });

  it('reports an empty file', () => {
    expect(parseBooksXml('   ')).toEqual({
      books: [],
      issues: [{ recordIndex: null, message: 'The file is empty' }],
    });
  });

  it('reports malformed XML as a whole-file error', () => {
    const result = parseBooksXml('<library><book><title>Oops</book></library>');
    expect(result.books).toEqual([]);
    expect(result.issues).toEqual([
      { recordIndex: null, message: 'The file is not well-formed XML' },
    ]);
  });

  it('reports non-XML content', () => {
    expect(parseBooksXml('title,author,pages It,King,1138').issues[0].recordIndex).toBeNull();
  });

  it('reports a wrong root element', () => {
    const result = parseBooksXml('<something>' + book('It', 'King', '1') + '</something>');
    expect(result.books).toEqual([]);
    expect(result.issues[0]).toEqual({
      recordIndex: null,
      message: 'Expected a <library,catalog,collection,books,items> root element, found <something>',
    });
  });

  it('skips a record with missing elements and reports each one', () => {
    const result = parseBooksXml(
      lib('<book><title>It</title></book>' + book('Carrie', 'King', '199')),
    );
    expect(result.books).toEqual([{ title: 'Carrie', author: 'King', pages: 199 }]);
    expect(result.issues).toEqual([
      { recordIndex: 1, field: 'author', message: 'Missing <author> element' },
      { recordIndex: 1, field: 'pages', message: 'Missing <pages> element' },
    ]);
  });

  it('skips a record with an empty title', () => {
    const result = parseBooksXml(lib(book('  ', 'King', '10')));
    expect(result.books).toEqual([]);
    expect(result.issues).toEqual([
      { recordIndex: 1, field: 'title', message: 'Title is required' },
    ]);
  });

  it.each(['abc', '-5', '3.5', '0', '300 pages', ''])('skips a record with pages = %j', (pages) => {
    const result = parseBooksXml(lib(book('It', 'King', pages)));
    expect(result.books).toEqual([]);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({ recordIndex: 1, field: 'pages' });
  });

  it('numbers records by their position among <book> elements', () => {
    const result = parseBooksXml(lib(book('A', 'X', '1') + '<note/>' + book('B', 'X', 'bad')));
    expect(result.issues[0].recordIndex).toBe(2);
  });

  it('ignores unknown elements', () => {
    const result = parseBooksXml(
      lib(
        '<meta>ignored</meta><book><isbn>123</isbn><title>It</title><author>King</author><pages>5</pages></book>',
      ),
    );
    expect(result).toEqual({ books: [{ title: 'It', author: 'King', pages: 5 }], issues: [] });
  });

  it('keeps non-Latin text', () => {
    const result = parseBooksXml(lib(book('Кобзар', 'Тарас Шевченко', '320')));
    expect(result.books[0]).toEqual({ title: 'Кобзар', author: 'Тарас Шевченко', pages: 320 });
  });
});
