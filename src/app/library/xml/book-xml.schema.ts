export const XML_SCHEMA = {
  root: ['library', 'catalog', 'collection', 'books', 'items'],
  rootLibrary: 'library',
  rootCatalog: 'catalog',
  rootBooks: 'books',
  rootItems: 'items',
  book: 'book',
  title: 'title',
  author: 'author',
  pages: 'pages',
} as const;

export type rootElementTypes = 'library' | 'catalog' | 'collection' | 'books' | 'items';

export const XML_MIME_TYPE = 'application/xml';
