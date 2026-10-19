import { Injectable, inject } from '@angular/core';
import { FileDownloadService } from '../../core/services/file-download.service';
import { mergeBooks } from '../helpers/book-merge';
import { ImportResult } from '../models/book.model';
import { parseBooksXml } from '../xml/book-xml.parser';
import { XML_MIME_TYPE } from '../xml/book-xml.schema';
import { serializeBooksXml } from '../xml/book-xml.serializer';
import { BookStore } from './book.store';

export const DEFAULT_EXPORT_FILE_NAME = 'library.xml';

@Injectable({ providedIn: 'root' })
export class LibraryIoService {
  private readonly store = inject(BookStore);
  private readonly downloader = inject(FileDownloadService);

  async importFile(file: Pick<File, 'name' | 'text'>): Promise<ImportResult> {
    let text: string;
    try {
      text = await file.text();
    } catch {
      return {
        fileName: file.name,
        added: 0,
        duplicates: [],
        issues: [{ recordIndex: null, message: 'The file could not be read' }],
      };
    }
    return this.importXml(text, file.name);
  }

  importXml(xml: string, fileName: string): ImportResult {
    const parsed = parseBooksXml(xml);
    const { toAdd, duplicates } = mergeBooks(this.store.books(), parsed.books);
    this.store.addMany(toAdd);
    return { fileName, added: toAdd.length, duplicates, issues: parsed.issues };
  }

  exportLibrary(fileName = DEFAULT_EXPORT_FILE_NAME): void {
    const books = this.store.books().map(({ title, author, pages }) => ({ title, author, pages }));
    this.downloader.download(serializeBooksXml(books), fileName, XML_MIME_TYPE);
  }
}
