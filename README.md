# Library

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.


Assumptions

1. Import merges the file into the current library instead of replacing it.
2. A book's identity is author + title, compared after trimming, collapsing whitespace and ignoring case. Accents are significant ("Andersen" ≠ "Andérsen").
3. Duplicates on import are skipped — both repeats inside the file and books already in the library and listed in the import summary.
4. Duplicates on add/edit are blocked with a warning in the dialog.
5. Invalid records are skipped and reported with their position. Malformed XML or a wrong root element imports nothing.
6. Pages must be a whole number from 1 to 100 000. Title is limited to 300 characters, author to 200.
7. The default sorting is authors A→Z, titles A→Z inside each author. Author reverses the order of the groups; the order inside each group is kept.
Title reorder books inside each group; the group order is kept.
8. Text comparison uses Intl.Collator: case- and accent-insensitive ordering, numeric-aware ("Vol 2" < "Vol 10"). Author spellings that differ only in case or accents ("King" / "KING") sort next to each other as separate groups.
9. Search matches part of the title, case-insensitively, ignoring surrounding spaces.
10. Export saves the whole library as library.xml, regardless of the current search filter.
11. Data is in memory only; reloading the page clears it.
12. Files are read as UTF-8 (File.text()); files in other encodings are not converted.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

