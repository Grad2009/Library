import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from '../../core/services/file-download.service';
import { parseBooksXml } from '../xml/book-xml.parser';
import { BookStore } from './book.store';
import { LibraryIoService } from './library-io.service';

const xml = (inner: string) => `<library>${inner}</library>`;
const book = (title: string, author: string, pages: string | number) =>
  `<book><title>${title}</title><author>${author}</author><pages>${pages}</pages></book>`;

describe('LibraryIoService', () => {
  let io: LibraryIoService;
  let store: BookStore;
  const download = vi.fn();

  beforeEach(() => {
    download.mockReset();
    TestBed.configureTestingModule({
      providers: [{ provide: FileDownloadService, useValue: { download } }],
    });
    io = TestBed.inject(LibraryIoService);
    store = TestBed.inject(BookStore);
  });

  describe('importFile', () => {
    it('adds new books and reports the count', async () => {
      const file = {
        name: 'a.xml',
        text: async () => xml(book('It', 'King', 1) + book('Carrie', 'King', 2)),
      };
      const result = await io.importFile(file);
      expect(result).toEqual({ fileName: 'a.xml', added: 2, duplicates: [], issues: [] });
      expect(store.books()).toHaveLength(2);
    });

    it('merges into the existing library and skips duplicates', async () => {
      store.add({ title: 'It', author: 'King', pages: 1 });
      const file = {
        name: 'b.xml',
        text: async () =>
          xml(book('IT', 'king', 5) + book('Carrie', 'King', 2) + book('Carrie', 'King', 3)),
      };
      const result = await io.importFile(file);
      expect(result.added).toBe(1);
      expect(result.duplicates).toEqual([
        { title: 'IT', author: 'king', source: 'library' },
        { title: 'Carrie', author: 'King', source: 'file' },
      ]);
      expect(store.books().map((b) => `${b.title}/${b.pages}`)).toEqual(['It/1', 'Carrie/2']);
    });

    it('passes invalid records through as issues', async () => {
      const file = { name: 'c.xml', text: async () => xml(book('It', 'King', 'abc')) };
      const result = await io.importFile(file);
      expect(result.added).toBe(0);
      expect(result.issues[0]).toMatchObject({ recordIndex: 1, field: 'pages' });
    });

    it('leaves the library unchanged for malformed XML', async () => {
      store.add({ title: 'It', author: 'King', pages: 1 });
      const result = await io.importFile({ name: 'd.xml', text: async () => '<library><book>' });
      expect(result.issues[0].recordIndex).toBeNull();
      expect(store.books()).toHaveLength(1);
    });

    it('reports a file that cannot be read', async () => {
      const result = await io.importFile({
        name: 'e.xml',
        text: () => Promise.reject(new Error('io')),
      });
      expect(result.issues).toEqual([{ recordIndex: null, message: 'The file could not be read' }]);
    });
  });

  describe('exportLibrary', () => {
    it('downloads the whole library as XML, ignoring the filter', () => {
      store.addMany([
        { title: 'It', author: 'King', pages: 1 },
        { title: 'Carrie', author: 'King', pages: 2 },
      ]);
      store.setQuery('carrie');
      io.exportLibrary();

      expect(download).toHaveBeenCalledOnce();
      const [content, fileName, mime] = download.mock.calls[0];
      expect(fileName).toBe('library.xml');
      expect(mime).toBe('application/xml');
      expect(parseBooksXml(content).books).toEqual([
        { title: 'It', author: 'King', pages: 1 },
        { title: 'Carrie', author: 'King', pages: 2 },
      ]);
    });

    it('uses a custom file name', () => {
      io.exportLibrary('mine.xml');
      expect(download.mock.calls[0][1]).toBe('mine.xml');
    });
  });
});
