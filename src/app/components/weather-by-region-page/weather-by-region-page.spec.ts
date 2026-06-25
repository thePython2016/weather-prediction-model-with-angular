import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherByRegionPage } from './weather-by-region-page';

describe('WeatherByRegionPage', () => {
  let component: WeatherByRegionPage;
  let fixture: ComponentFixture<WeatherByRegionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherByRegionPage],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherByRegionPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
