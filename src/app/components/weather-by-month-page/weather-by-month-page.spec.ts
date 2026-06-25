import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherByMonthPage } from './weather-by-month-page';

describe('WeatherByMonthPage', () => {
  let component: WeatherByMonthPage;
  let fixture: ComponentFixture<WeatherByMonthPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherByMonthPage],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherByMonthPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
