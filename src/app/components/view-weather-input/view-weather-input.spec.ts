import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWeatherInput } from './view-weather-input';

describe('ViewWeatherInput', () => {
  let component: ViewWeatherInput;
  let fixture: ComponentFixture<ViewWeatherInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWeatherInput],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewWeatherInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
