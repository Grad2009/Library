import { BookDraft } from '../models/book.model';
import { XML_SCHEMA } from './book-xml.schema';

const INDENT = '  ';

export function serializeBooksXml(books: readonly BookDraft[]): string {
  const doc = document.implementation.createDocument(null, XML_SCHEMA.root[0], null);
  const root = doc.documentElement;

  for (const book of books) {
    root.appendChild(doc.createTextNode(`\n${INDENT}`));
    const bookEl = doc.createElement(XML_SCHEMA.book);

    const fields: [string, string][] = [
      [XML_SCHEMA.title, book.title],
      [XML_SCHEMA.author, book.author],
      [XML_SCHEMA.pages, String(book.pages)],
    ];
    for (const [name, value] of fields) {
      bookEl.appendChild(doc.createTextNode(`\n${INDENT}${INDENT}`));
      const el = doc.createElement(name);
      el.textContent = value;
      bookEl.appendChild(el);
    }
    bookEl.appendChild(doc.createTextNode(`\n${INDENT}`));
    root.appendChild(bookEl);
  }
  if (books.length > 0) {
    root.appendChild(doc.createTextNode('\n'));
  }

  const body = new XMLSerializer().serializeToString(doc);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`;
}
