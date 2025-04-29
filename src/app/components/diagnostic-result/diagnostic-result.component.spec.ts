import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticResultComponent } from './diagnostic-result.component';

describe('DiagnosticResultComponent', () => {
  let component: DiagnosticResultComponent;
  let fixture: ComponentFixture<DiagnosticResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
