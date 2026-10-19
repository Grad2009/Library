import {ChangeDetectionStrategy, Component} from '@angular/core';
import LibraryPage from './library/library-page/library-page';
import {MatIconModule} from '@angular/material/icon';

@Component({
  imports: [LibraryPage, MatIconModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
