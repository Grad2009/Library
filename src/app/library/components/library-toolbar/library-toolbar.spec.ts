import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryToolbar } from './library-toolbar';

describe('LibraryToolbar', () => {
  let component: LibraryToolbar;
  let fixture: ComponentFixture<LibraryToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryToolbar],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
