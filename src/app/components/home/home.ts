import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Stat {
  title: string; value: string; growth: string; positive: boolean; icon: string;
}

export interface Product {
  name: string; price: string; sold: number; image: string;
}

// User session


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  baseurl = 'http://localhost:8000';
  endpoint = '/current.jsonv2';

  regions: string[] = [
    'Mwanza', 'Dar es Salaam', 'Arusha', 'Dodoma', 'Mbeya', 'Tanga',
    'Morogoro', 'Zanzibar', 'Tabora', 'Kigoma', 'Shinyanga', 'Kagera',
    'Iringa', 'Mara', 'Mtwara', 'Ruvuma', 'Lindi', 'Singida',
    'Rukwa', 'Katavi', 'Njombe', 'Simiyu', 'Geita', 'Songwe', 'Pwani',
  ];

  years: number[] = [2012, 2013, 2014, 2015];
  selectedRegion = 'Mwanza';

  // ── Stat cards ───────────────────────────────────────────────────
  stats: Stat[] = [
    { title: 'Temperature', value: '--', growth: 'Loading…', positive: true, icon: 'thermostat' },
    { title: 'Humidity',    value: '--', growth: 'Loading…', positive: true, icon: 'water_drop' },
    { title: 'Wind Speed',  value: '--', growth: 'Loading…', positive: true, icon: 'air' },
    { title: 'Pressure',    value: '--', growth: 'Loading…', positive: true, icon: 'speed' },
  ];

  // ── Bar chart — temp per region ──────────────────────────────────
  chartBars: number[]   = []; // normalized 0–100, used for bar height
  chartValues: number[] = []; // actual temp_c values, used for labels/tooltips
  chartMonths: string[] = []; // region abbreviations

  // ── Donut — cloud cover ──────────────────────────────────────────
  targetPercent = 0;
  targetSales   = 0;
  targetGoal    = 100;

  // ── Products — weather highlights ────────────────────────────────
  products: Product[] = [
    { name: 'Precipitation', price: '--', sold: 0, image: 'https://via.placeholder.com/80x80/60a5fa/ffffff?text=💧' },
    { name: 'Feels Like',    price: '--', sold: 0, image: 'https://via.placeholder.com/80x80/6C63FF/ffffff?text=🌡️' },
    { name: 'Wind Dir',      price: '--', sold: 0, image: 'https://via.placeholder.com/80x80/2dd4bf/ffffff?text=🧭' },
    { name: 'Condition',     price: '--', sold: 0, image: 'https://via.placeholder.com/80x80/f97316/ffffff?text=🌤️' },
  ];

  // ── Offers — year forecasts ──────────────────────────────────────
  offers: { label: string; desc: string; color: string }[] = [
    { label: '2012 Forecast', desc: 'Loading prediction…', color: 'purple' },
    { label: '2013 Forecast', desc: 'Loading prediction…', color: 'teal'   },
    { label: '2014 Forecast', desc: 'Loading prediction…', color: 'coral'  },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.selectedRegion = this.regions[0];
    await this.loadTodayWeather();
    await this.loadAllRegionTemps();
    await this.loadAllPredictions();
  }

  async onRegionChange(): Promise<void> {
    await this.loadTodayWeather();
    await this.loadAllPredictions();
    // chart stays showing all regions — no reload needed
  }

  // ── Today's weather → stat cards, donut, products ───────────────
  private async loadTodayWeather(): Promise<void> {
    try {
      const res    = await fetch(`${this.baseurl}${this.endpoint}?region=${this.selectedRegion}`);
      const result = await res.json();

      if (res.ok) {
        const c          = result.current;
        const isHot      = c.temp_c > 30;
        const isWindy    = c.wind_kph > 40;
        const isHumid    = c.humidity > 70;
        const isHighPres = c.pressure_mb > 1015;

        this.stats = [
          { title: 'Temperature', value: `${c.temp_c}°C`,       growth: isHot      ? 'Hot day'       : 'Mild day',      positive: !isHot,      icon: 'thermostat' },
          { title: 'Humidity',    value: `${c.humidity}%`,      growth: isHumid    ? 'High humidity' : 'Comfortable',   positive: !isHumid,    icon: 'water_drop' },
          { title: 'Wind Speed',  value: `${c.wind_kph} km/h`,  growth: isWindy    ? 'Strong winds'  : 'Calm winds',    positive: !isWindy,    icon: 'air' },
          { title: 'Pressure',    value: `${c.pressure_mb} mb`, growth: isHighPres ? 'High pressure'  : 'Low pressure',  positive: isHighPres,  icon: 'speed' },
        ];

        this.targetPercent = c.cloud;
        this.targetSales   = c.feelslike_c;
        this.targetGoal    = 100;

        this.products = [
          { name: 'Precipitation', price: `${c.precip_mm} mm`,  sold: c.precip_mm,   image: 'https://via.placeholder.com/80x80/60a5fa/ffffff?text=💧' },
          { name: 'Feels Like',    price: `${c.feelslike_c}°C`, sold: c.feelslike_c, image: 'https://via.placeholder.com/80x80/6C63FF/ffffff?text=🌡️' },
          { name: 'Wind Dir',      price: c.wind_dir,            sold: 0,             image: 'https://via.placeholder.com/80x80/2dd4bf/ffffff?text=🧭' },
          { name: 'Condition',     price: c.condition.text,      sold: 0,             image: 'https://via.placeholder.com/80x80/f97316/ffffff?text=🌤️' },
        ];

        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('Weather load error:', err);
    }
  }

  // ── Fetch temp for ALL regions → bar chart ───────────────────────
  private async loadAllRegionTemps(): Promise<void> {
    const temps: number[] = [];

    for (const region of this.regions) {
      try {
        const res    = await fetch(`${this.baseurl}${this.endpoint}?region=${encodeURIComponent(region)}`);
        const result = await res.json();
        if (res.ok) {
          temps.push(result.current.temp_c);
        } else {
          temps.push(0);
        }
      } catch {
        temps.push(0);
      }
    }

    const maxTemp      = Math.max(...temps, 1);
    this.chartBars      = temps.map(t => Math.round((t / maxTemp) * 100));
    this.chartValues    = temps; // keep raw values for labels/tooltips
    this.chartMonths    = this.regions.map(r => r.slice(0, 3));
    this.cdr.detectChanges();
  }

  // ── Year forecasts → offers list ────────────────────────────────
  private async loadAllPredictions(): Promise<void> {
    const endpoint = '/predict-by-year/';
    const colors   = ['purple', 'teal', 'coral'];
    const results: { year: number; temp: number; prec: number; wind: number }[] = [];

    for (const year of this.years) {
      try {
        const res  = await fetch(`${this.baseurl}${endpoint}?year=${year}`);
        const data = await res.json();
        if (res.ok) {
          results.push({ year, temp: data.temp_max, prec: data.precipitation, wind: data.wind });
        }
      } catch (e) {
        console.error(`Prediction error for ${year}:`, e);
      }
    }

    if (results.length > 0) {
      this.offers = results.slice(0, 3).map((r, i) => ({
        label: `${r.year} Forecast`,
        desc:  `Temp: ${r.temp}°C  •  Precip: ${r.prec} mm  •  Wind: ${r.wind} km/h`,
        color: colors[i],
      }));
      this.cdr.detectChanges();
    }
  }

  get circumference(): number    { return 2 * Math.PI * 54; }
  get strokeDashoffset(): number { return this.circumference * (1 - this.targetPercent / 100); }
}
