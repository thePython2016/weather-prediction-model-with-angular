import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWeatherInput } from './add-weather-input';

describe('AddWeatherInput', () => {
  let component: AddWeatherInput;
  let fixture: ComponentFixture<AddWeatherInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWeatherInput],
    }).compileComponents();

    fixture = TestBed.createComponent(AddWeatherInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
