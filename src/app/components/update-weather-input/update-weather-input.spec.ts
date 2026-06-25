import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateWeatherInput } from './update-weather-input';

describe('UpdateWeatherInput', () => {
  let component: UpdateWeatherInput;
  let fixture: ComponentFixture<UpdateWeatherInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateWeatherInput],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateWeatherInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
