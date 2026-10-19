import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportSummaryDialog } from './import-summary-dialog';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('ImportSummaryDialog', () => {
  let component: ImportSummaryDialog;
  let fixture: ComponentFixture<ImportSummaryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportSummaryDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportSummaryDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
