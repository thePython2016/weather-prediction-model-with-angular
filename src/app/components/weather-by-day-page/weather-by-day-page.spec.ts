import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherByDayPage } from './weather-by-day-page';

describe('WeatherByDayPage', () => {
  let component: WeatherByDayPage;
  let fixture: ComponentFixture<WeatherByDayPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherByDayPage],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherByDayPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
