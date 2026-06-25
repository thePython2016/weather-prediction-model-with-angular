import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TodayWeather {
  humidity: number;
  cloud: number;
  country: string;
  temp_c: number;
  temp_f: number;
  wind_kph: number;
  wind_dir: string;
  pressure_mb: number;
  prec_mm: number;
  feelslike_c: number;
  feelslike_f: number;
  region: string;
  condition: string;
}

interface Prediction {
  Temp: number;
  Prec: number;
  Wind: number;
}

@Component({
  selector: 'app-weather-by-region-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather-by-region-page.html',
  styleUrl: './weather-by-region-page.css',
})
export class WeatherByRegionPage implements OnInit {
  baseurl = 'http://localhost:8000';
  endpoint = '/current.jsonv2';

  searchQuery = '';

  regions: string[] = [
    'Mwanza', 'Dar es Salaam', 'Arusha', 'Dodoma', 'Mbeya', 'Tanga',
    'Morogoro', 'Zanzibar', 'Tabora', 'Kigoma', 'Shinyanga', 'Kagera',
    'Iringa', 'Mara', 'Mtwara', 'Ruvuma', 'Lindi', 'Singida',
    'Rukwa', 'Katavi', 'Njombe', 'Simiyu', 'Geita', 'Songwe', 'Pwani',
  ];

  years: number[] = [2012, 2013, 2014, 2015];

  selectedRegion = 'Mwanza';
  selectedYear = 2014;

  todayWeather: TodayWeather | null = null;
  prediction: Prediction | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.selectedRegion = this.regions[0];
    this.selectedYear = this.years[0];
    await this.loadTodayWeather();
    await this.loadPrediction();
  }

  async onRegionChange(): Promise<void> {
    await this.loadTodayWeather();
    await this.loadPrediction();
  }

  async onYearChange(): Promise<void> {
    await this.loadPrediction();
  }

  // ── Bar height as % of 120px container ──────────────────────────

  /** Precipitation max scale: 300 mm */
  get precipHeightPercent(): number {
    if (!this.prediction) return 0;
    return Math.min((this.prediction.Prec / 300) * 100, 100);
  }

  /** Wind max scale: 120 km/h */
  get windHeightPercent(): number {
    if (!this.prediction) return 0;
    return Math.min((this.prediction.Wind / 120) * 100, 100);
  }

  // ── Color based on value ─────────────────────────────────────────

  /** Precipitation: green (light) → yellow (moderate) → red (heavy) */
  get precipColor(): string {
    const v = this.prediction?.Prec ?? 0;
    if (v < 50)  return '#34d399'; // green
    if (v < 150) return '#fbbf24'; // yellow
    return '#f87171';              // red
  }

  /** Wind: teal (calm) → orange (moderate) → red (strong) */
  get windColor(): string {
    const v = this.prediction?.Wind ?? 0;
    if (v < 30) return '#2dd4bf';  // teal
    if (v < 70) return '#fb923c';  // orange
    return '#f87171';              // red
  }

  // ── Label helpers ────────────────────────────────────────────────

  get precipLabel(): string {
    const v = this.prediction?.Prec ?? 0;
    if (v < 50)  return 'Light';
    if (v < 150) return 'Moderate';
    return 'Heavy';
  }

  get windLabel(): string {
    const v = this.prediction?.Wind ?? 0;
    if (v < 30) return 'Calm';
    if (v < 70) return 'Moderate';
    return 'Strong';
  }

  // ── Data loading ─────────────────────────────────────────────────

  private async loadTodayWeather(): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseurl}${this.endpoint}?region=${this.selectedRegion}`,
        { method: 'GET' }
      );
      const result = await response.json();
      if (response.ok) {
        this.todayWeather = {
          region: result.location.region,
          country: result.location.country,
          temp_c: result.current.temp_c,
          temp_f: result.current.temp_f,
          wind_kph: result.current.wind_kph,
          wind_dir: result.current.wind_dir,
          pressure_mb: result.current.pressure_mb,
          prec_mm: result.current.precip_mm,
          humidity: result.current.humidity,
          cloud: result.current.cloud,
          feelslike_c: result.current.feelslike_c,
          feelslike_f: result.current.feelslike_f,
          condition: result.current.condition.text,
        };
        this.cdr.detectChanges();
      } else {
        console.log('Not Connected');
      }
    } catch (err) {
      alert(`Error ${err}`);
    }
  }

  private async loadPrediction(): Promise<void> {
    const endpointbyyear = '/predict-by-year/';
    try {
      const res = await fetch(
        `${this.baseurl}${endpointbyyear}?year=${this.selectedYear}`,
        { method: 'GET' }
      );
      const data = await res.json();
      if (res.ok) {
        this.prediction = {
          Temp: data.temperature,
          Prec: data.precipitation,
          Wind: data.wind,
        };
        this.cdr.detectChanges();
      } else {
        console.log('Cannot predict by year');
        alert('You cannot predict by Year');
      }
    } catch (e) {
      alert(`Error Occurred ${e}`);
    }
  }

  refreshToday(): void {
    this.loadTodayWeather();
  }
}