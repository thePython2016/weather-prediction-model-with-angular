import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetPage } from './password-reset-page';

describe('PasswordResetPage', () => {
  let component: PasswordResetPage;
  let fixture: ComponentFixture<PasswordResetPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordResetPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
