import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryThisMonthComponent } from './summary-this-month.component';

describe('SummaryThisMonthComponent', () => {
  let component: SummaryThisMonthComponent;
  let fixture: ComponentFixture<SummaryThisMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryThisMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryThisMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
