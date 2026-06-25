import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-charts-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts-page.html',
  styleUrls: ['./charts-page.css'],
})
export class ChartsPage implements OnInit {
  baseurl = 'http://localhost:8000';
  endpoint = '/current.jsonv2';

  regions: string[] = [
    'Mwanza', 'Dar es Salaam', 'Arusha', 'Dodoma', 'Mbeya', 'Tanga',
    'Morogoro', 'Zanzibar', 'Tabora', 'Kigoma', 'Shinyanga', 'Kagera',
    'Iringa', 'Mara', 'Mtwara', 'Ruvuma', 'Lindi', 'Singida',
    'Rukwa', 'Katavi', 'Njombe', 'Simiyu', 'Geita', 'Songwe', 'Pwani',
  ];

  // ── Bar chart — temperature by region ────────────────────────────
  chartBars: number[]   = []; // normalized 0–100, used for bar height
  chartValues: number[] = []; // actual temp_c values, used for labels/tooltips
  chartLabels: string[] = []; // region abbreviations (3-letter)
  chartLoading = true;

  // ── Line chart — predicted temperature per year ──────────────────
  predictEndpoint = '/predict-by-year/';
  years: number[] = [2012, 2013, 2014, 2015];
  linePoints: { x: number; y: number }[] = [];
  lineValues: number[] = []; // raw temp_max values, for labels/tooltips
  lineLabels: string[] = []; // year labels
  lineLoading = true;

  donutData: { label: string; pct: number; color: string }[] = [];
  donutLoading = true;

  private readonly donutColors: Record<string, string> = {
    Sunny:  '#6C63FF',
    Cloudy: '#b0aed6',
    Rainy:  '#1D9E75',
    Stormy: '#D85A30',
  };

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadAllRegionTemps(),
      this.loadYearlyTemps(),
    ]);
  }

  // ── Bucket a raw condition string into one of the 4 donut categories ────
  private bucketCondition(text: string): 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' {
    const c = (text || '').toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) return 'Stormy';
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'Rainy';
    if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog')) return 'Cloudy';
    return 'Sunny';
  }

  // ── Fetch temp + condition for ALL regions → bar chart + donut ──────────
  private async loadAllRegionTemps(): Promise<void> {
    this.chartLoading  = true;
    this.donutLoading  = true;

    const fetchOne = async (region: string): Promise<{ temp: number; condition: string }> => {
      try {
        const res    = await fetch(`${this.baseurl}${this.endpoint}?region=${encodeURIComponent(region)}`);
        const result = await res.json();
        if (res.ok) {
          return { temp: result.current.temp_c, condition: result.current.condition?.text ?? '' };
        }
        return { temp: 0, condition: '' };
      } catch {
        return { temp: 0, condition: '' };
      }
    };

    // Fire all region requests concurrently instead of one-by-one
    const data  = await Promise.all(this.regions.map(fetchOne));
    const temps = data.map(d => d.temp);

    const maxTemp    = Math.max(...temps, 1);
    this.chartBars   = temps.map(t => Math.round((t / maxTemp) * 100));
    this.chartValues = temps;
    this.chartLabels = this.regions.map(r => r.slice(0, 3));
    this.chartLoading = false;

    // ── Tally conditions into Sunny / Cloudy / Rainy / Stormy buckets ────
    const counts: Record<string, number> = { Sunny: 0, Cloudy: 0, Rainy: 0, Stormy: 0 };
    for (const d of data) {
      counts[this.bucketCondition(d.condition)]++;
    }

    const total = data.length || 1;
    this.donutData = (Object.keys(counts) as Array<keyof typeof counts>)
      .map(label => ({
        label,
        pct: Math.round((counts[label] / total) * 100),
        color: this.donutColors[label],
      }))
      .filter(d => d.pct > 0);

    this.donutLoading = false;
    this.cdr.detectChanges();
  }

  // ── Fetch predicted temp for each year → line chart ──────────────
  private async loadYearlyTemps(): Promise<void> {
    this.lineLoading = true;

    const fetchOne = async (year: number): Promise<number> => {
      try {
        const res  = await fetch(`${this.baseurl}${this.predictEndpoint}?year=${year}`);
        const data = await res.json();
        return res.ok ? data.temp_max : 0;
      } catch {
        return 0;
      }
    };

    // Fire all year requests concurrently instead of one-by-one
    const temps = await Promise.all(this.years.map(fetchOne));

    // Map temps onto the 300×160 viewBox: x spread evenly, y scaled by range
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range   = maxTemp - minTemp || 1;
    const padTop  = 20;   // px from top of viewBox
    const padBot  = 20;   // px from bottom of viewBox
    const plotH   = 160 - padTop - padBot;
    const stepX   = this.years.length > 1 ? 300 / (this.years.length - 1) : 0;

    this.linePoints = temps.map((t, i) => ({
      x: Math.round(i * stepX),
      y: Math.round(padTop + (1 - (t - minTemp) / range) * plotH),
    }));
    this.lineValues  = temps;
    this.lineLabels  = this.years.map(y => String(y));
    this.lineLoading = false;
    this.cdr.detectChanges();
  }

  /** Build the SVG polyline points string from linePoints */
  get linePolyline(): string {
    return this.linePoints.map(p => `${p.x},${p.y}`).join(' ');
  }

  // ── Donut chart — geometry derived from donutData ───────────────
  readonly donutRadius = 50;
  get donutCircumference(): number {
    return 2 * Math.PI * this.donutRadius;
  }

  /** Dash array for a segment: [arc length, remaining circle] */
  donutDashArray(pct: number): string {
    const len = (pct / 100) * this.donutCircumference;
    return `${len} ${this.donutCircumference - len}`;
  }

  /** Cumulative rotation (deg) so each segment starts where the previous one ended */
  donutRotation(index: number): number {
    const priorPct = this.donutData.slice(0, index).reduce((sum, d) => sum + d.pct, 0);
    return -90 + (priorPct / 100) * 360;
  }
}