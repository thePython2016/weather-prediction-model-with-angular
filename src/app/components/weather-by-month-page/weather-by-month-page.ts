import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MonthWeather {
  temp: number;
  feelsLike: number;
  condition: string;
  wind: number;
  windDir: string;
  pressure: number;
  precipitation: number;
  humidity: number;
  cloud: number;
}

interface Prediction {
  temp: number;
  precipitation: number;
  wind: number;
}

interface MonthOption {
  label: string;
}

// -------------------------------------------------------------------
// DEMO DATA — replace with real API responses when you implement fetch
// -------------------------------------------------------------------
const DEMO_MONTH_WEATHER: Record<string, MonthWeather> = {
  'January':   { temp: 28, feelsLike: 30, condition: 'Rainy',        wind: 16, windDir: 'NE',  pressure: 1012, precipitation: 98,  humidity: 82, cloud: 80 },
  'February':  { temp: 29, feelsLike: 31, condition: 'Rainy',        wind: 17, windDir: 'NE',  pressure: 1011, precipitation: 76,  humidity: 79, cloud: 72 },
  'March':     { temp: 28, feelsLike: 29, condition: 'Rainy',        wind: 15, windDir: 'N',   pressure: 1013, precipitation: 120, humidity: 85, cloud: 88 },
  'April':     { temp: 26, feelsLike: 25, condition: 'Stormy',       wind: 20, windDir: 'NW',  pressure: 1010, precipitation: 180, humidity: 90, cloud: 95 },
  'May':       { temp: 24, feelsLike: 22, condition: 'Cloudy',       wind: 14, windDir: 'SW',  pressure: 1016, precipitation: 42,  humidity: 72, cloud: 65 },
  'June':      { temp: 22, feelsLike: 20, condition: 'Cloudy',       wind: 13, windDir: 'S',   pressure: 1018, precipitation: 18,  humidity: 60, cloud: 55 },
  'July':      { temp: 21, feelsLike: 19, condition: 'Partly Cloudy',wind: 12, windDir: 'SE',  pressure: 1019, precipitation: 8,   humidity: 55, cloud: 40 },
  'August':    { temp: 22, feelsLike: 20, condition: 'Sunny',        wind: 14, windDir: 'SE',  pressure: 1018, precipitation: 10,  humidity: 52, cloud: 20 },
  'September': { temp: 25, feelsLike: 24, condition: 'Sunny',        wind: 16, windDir: 'E',   pressure: 1015, precipitation: 15,  humidity: 54, cloud: 18 },
  'October':   { temp: 27, feelsLike: 28, condition: 'Partly Cloudy',wind: 18, windDir: 'NE',  pressure: 1013, precipitation: 45,  humidity: 68, cloud: 50 },
  'November':  { temp: 28, feelsLike: 29, condition: 'Rainy',        wind: 17, windDir: 'N',   pressure: 1012, precipitation: 95,  humidity: 78, cloud: 78 },
  'December':  { temp: 28, feelsLike: 30, condition: 'Rainy',        wind: 16, windDir: 'NE',  pressure: 1012, precipitation: 105, humidity: 81, cloud: 82 },
};

const DEMO_MONTH_PREDICTIONS: Record<string, Record<number, Prediction>> = {
  'January':   { 2012: { temp: 26, precipitation: 90,  wind: 14 }, 2013: { temp: 27, precipitation: 94,  wind: 15 }, 2014: { temp: 27, precipitation: 98,  wind: 16 }, 2015: { temp: 28, precipitation: 100, wind: 17 } },
  'February':  { 2012: { temp: 27, precipitation: 70,  wind: 14 }, 2013: { temp: 28, precipitation: 73,  wind: 15 }, 2014: { temp: 28, precipitation: 76,  wind: 16 }, 2015: { temp: 29, precipitation: 78,  wind: 17 } },
  'March':     { 2012: { temp: 26, precipitation: 110, wind: 13 }, 2013: { temp: 27, precipitation: 115, wind: 14 }, 2014: { temp: 27, precipitation: 120, wind: 15 }, 2015: { temp: 28, precipitation: 125, wind: 15 } },
  'April':     { 2012: { temp: 24, precipitation: 165, wind: 18 }, 2013: { temp: 25, precipitation: 172, wind: 19 }, 2014: { temp: 25, precipitation: 180, wind: 20 }, 2015: { temp: 26, precipitation: 185, wind: 21 } },
  'May':       { 2012: { temp: 22, precipitation: 38,  wind: 12 }, 2013: { temp: 23, precipitation: 40,  wind: 13 }, 2014: { temp: 23, precipitation: 42,  wind: 14 }, 2015: { temp: 24, precipitation: 44,  wind: 14 } },
  'June':      { 2012: { temp: 20, precipitation: 14,  wind: 11 }, 2013: { temp: 21, precipitation: 16,  wind: 12 }, 2014: { temp: 21, precipitation: 18,  wind: 13 }, 2015: { temp: 22, precipitation: 20,  wind: 13 } },
  'July':      { 2012: { temp: 19, precipitation: 6,   wind: 10 }, 2013: { temp: 20, precipitation: 7,   wind: 11 }, 2014: { temp: 20, precipitation: 8,   wind: 12 }, 2015: { temp: 21, precipitation: 9,   wind: 12 } },
  'August':    { 2012: { temp: 20, precipitation: 8,   wind: 12 }, 2013: { temp: 21, precipitation: 9,   wind: 13 }, 2014: { temp: 21, precipitation: 10,  wind: 14 }, 2015: { temp: 22, precipitation: 11,  wind: 14 } },
  'September': { 2012: { temp: 23, precipitation: 12,  wind: 14 }, 2013: { temp: 24, precipitation: 13,  wind: 15 }, 2014: { temp: 24, precipitation: 15,  wind: 16 }, 2015: { temp: 25, precipitation: 16,  wind: 17 } },
  'October':   { 2012: { temp: 25, precipitation: 40,  wind: 16 }, 2013: { temp: 26, precipitation: 42,  wind: 17 }, 2014: { temp: 26, precipitation: 45,  wind: 18 }, 2015: { temp: 27, precipitation: 47,  wind: 18 } },
  'November':  { 2012: { temp: 26, precipitation: 88,  wind: 15 }, 2013: { temp: 27, precipitation: 91,  wind: 16 }, 2014: { temp: 27, precipitation: 95,  wind: 17 }, 2015: { temp: 28, precipitation: 98,  wind: 17 } },
  'December':  { 2012: { temp: 26, precipitation: 96,  wind: 14 }, 2013: { temp: 27, precipitation: 100, wind: 15 }, 2014: { temp: 27, precipitation: 105, wind: 16 }, 2015: { temp: 28, precipitation: 108, wind: 17 } },
};

@Component({
  selector: 'app-weather-by-month-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather-by-month-page.html',
  styleUrl: './weather-by-month-page.css',
})
export class WeatherByMonthPage implements OnInit {

  searchQuery = '';

  months: MonthOption[] = [
    { label: 'January' }, { label: 'February' }, { label: 'March' },
    { label: 'April' },   { label: 'May' },       { label: 'June' },
    { label: 'July' },    { label: 'August' },    { label: 'September' },
    { label: 'October' }, { label: 'November' },  { label: 'December' },
  ];

  years: number[] = [2012, 2013, 2014, 2015];

  selectedMonth = 'January';
  selectedYear  = 2014;

  monthWeather!: MonthWeather;
  prediction!: Prediction;

  // ── Stat card computed values ──────────────────────────
  get totalMonths(): number { return this.months.length; }

  get avgTemp(): number {
    const all = Object.values(DEMO_MONTH_WEATHER);
    return Math.round(all.reduce((s, m) => s + m.temp, 0) / all.length);
  }

  get rainyMonths(): number {
    return Object.values(DEMO_MONTH_WEATHER)
      .filter(m => m.condition === 'Rainy' || m.condition === 'Stormy').length;
  }

  get rainyMonthsPct(): number {
    return Math.round((this.rainyMonths / this.months.length) * 100);
  }

  get avgWind(): number {
    const all = Object.values(DEMO_MONTH_WEATHER);
    return Math.round(all.reduce((s, m) => s + m.wind, 0) / all.length);
  }

  // ── Condition icon ─────────────────────────────────────
  get conditionIcon(): string {
    const c = this.monthWeather?.condition ?? '';
    if (c === 'Sunny')         return 'bi-sun-fill';
    if (c === 'Rainy')         return 'bi-cloud-rain-fill';
    if (c === 'Stormy')        return 'bi-cloud-lightning-rain-fill';
    if (c === 'Partly Cloudy') return 'bi-cloud-sun-fill';
    return 'bi-cloud-fill';
  }

  // ── Gauge helpers ──────────────────────────────────────
  readonly GAUGE_TOTAL = 220;
  readonly TEMP_MIN    = 0;
  readonly TEMP_MAX    = 45;

  get gaugePercent(): number {
    return Math.min(1, Math.max(0,
      (this.prediction.temp - this.TEMP_MIN) / (this.TEMP_MAX - this.TEMP_MIN)
    ));
  }

  get gaugeDash(): string   { return `${this.GAUGE_TOTAL} ${this.GAUGE_TOTAL}`; }
  get gaugeOffset(): number { return this.GAUGE_TOTAL * (1 - this.gaugePercent); }

  get gaugeColor(): string {
    const p = this.gaugePercent;
    if (p < 0.33) return '#60a5fa';
    if (p < 0.66) return '#fb923c';
    return '#ef4444';
  }

  // ── Bar helpers ────────────────────────────────────────
  readonly PRECIP_MAX = 200;  // monthly precipitation can be higher
  readonly WIND_MAX   = 50;

  get precipPercent(): number { return Math.min(100, (this.prediction.precipitation / this.PRECIP_MAX) * 100); }
  get windPercent(): number   { return Math.min(100, (this.prediction.wind / this.WIND_MAX) * 100); }

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void { this.loadData(); }

  onMonthChange(): void { this.loadData(); }
  onYearChange():  void { this.loadPrediction(); }

  refreshMonth(): void {
    // TODO: call your live-weather API here
    this.loadMonthWeather();
  }

  // ── Data loading — swap with real HTTP calls ───────────
  private loadData(): void {
    this.loadMonthWeather();
    this.loadPrediction();
  }

  private loadMonthWeather(): void {
    // TODO: replace with  this.weatherService.getMonthWeather(this.selectedMonth)
    this.monthWeather = DEMO_MONTH_WEATHER[this.selectedMonth] ?? {
      temp: 25, feelsLike: 24, condition: 'Partly Cloudy',
      wind: 15, windDir: 'N', pressure: 1015,
      precipitation: 30, humidity: 60, cloud: 40,
    };
  }

  private loadPrediction(): void {
    // TODO: replace with  this.weatherService.getMonthPrediction(this.selectedMonth, this.selectedYear)
    const monthData = DEMO_MONTH_PREDICTIONS[this.selectedMonth] ?? {};
    this.prediction = monthData[this.selectedYear] ?? { temp: 25, precipitation: 50, wind: 14 };
  }
}