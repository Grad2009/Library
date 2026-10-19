import { BookDraft, ParseIssue, ParseResult } from '../models/book.model';
import { normalizeDraft, parsePages, validateBookDraft } from '../helpers/book-validation';
import {rootElementTypes, XML_MIME_TYPE, XML_SCHEMA} from './book-xml.schema';

// Malformed XML or a wrong root element - no books, one whole file issue
// Each <book> is validated; invalid ones are skipped and reported with their 1-based index
// Text is read via textContent, so entities and CDATA work
// Unknown elements are ignored
export function parseBooksXml(xml: string): ParseResult {
  if (!xml.trim()) {
    return fileError('The file is empty');
  }

  const doc = new DOMParser().parseFromString(xml, XML_MIME_TYPE);

  // DOMParser does not throw: browsers return a document containing <parsererror>.
  if (doc.getElementsByTagName('parsererror').length > 0) {
    return fileError('The file is not well-formed XML');
  }

  const root = doc.documentElement;
  if (!root ||  !XML_SCHEMA.root.includes(root.localName as rootElementTypes)) {
    return fileError(
      `Expected a <${XML_SCHEMA.root.toString()}> root element, found <${root?.localName ?? 'nothing'}>`,
    );
  }

  const books: BookDraft[] = [];
  const issues: ParseIssue[] = [];

  childElements(root, XML_SCHEMA.book).forEach((element, i) => {
    const recordIndex = i + 1;
    const recordIssues: ParseIssue[] = [];

    const title = childText(element, XML_SCHEMA.title);
    const author = childText(element, XML_SCHEMA.author);
    const pagesText = childText(element, XML_SCHEMA.pages);

    if (title === null) {
      recordIssues.push(missing(recordIndex, 'title'));
    }
    if (author === null) {
      recordIssues.push(missing(recordIndex, 'author'));
    }
    if (pagesText === null) {
      recordIssues.push(missing(recordIndex, 'pages'));
    }

    if (recordIssues.length === 0) {
      const pages = parsePages(pagesText!);
      const draft = normalizeDraft({ title: title!, author: author!, pages: pages ?? Number.NaN });
      for (const error of validateBookDraft(draft)) {
        recordIssues.push({ recordIndex, field: error.field, message: error.message });
      }
      if (recordIssues.length === 0) {
        books.push(draft);
      }
    }

    issues.push(...recordIssues);
  });

  return { books, issues };
}

function fileError(message: string): ParseResult {
  return { books: [], issues: [{ recordIndex: null, message }] };
}

function missing(recordIndex: number, field: keyof BookDraft): ParseIssue {
  return { recordIndex, field, message: `Missing <${field}> element` };
}

function childElements(parent: Element, name: string): Element[] {
  return Array.from(parent.children).filter((el) => el.localName === name);
}

function childText(parent: Element, name: string): string | null {
  const el = childElements(parent, name)[0];
  return el ? (el.textContent ?? '') : null;
}
