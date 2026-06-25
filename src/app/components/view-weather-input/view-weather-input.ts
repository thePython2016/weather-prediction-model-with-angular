import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';

export interface WeatherRecord {
  precipitation: number;
  temp_max: number;
  temp_min: number;
  wind: number;
  year: number;
  month: number;
  day: number;
  weather: string;
}

@Component({
  selector: 'app-view-weather-input',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './view-weather-input.html',
  styleUrls: ['./view-weather-input.css'],
})
export class ViewWeatherInput implements AfterViewInit {

  displayedColumns: string[] = [
    'precipitation', 'temp_max', 'temp_min',
    'wind', 'year', 'month', 'day', 'weather'
  ];

  baseurl  = 'http://localhost:8000';
  endpoint = '/weatherdata/';

  dataSource = new MatTableDataSource<WeatherRecord>([]);
  loading = true;

  // Server-side pagination state
  totalRecords = 0;
  currentPage  = 1;
  pageSize     = 10;
  searchTerm   = '';

  @ViewChild(MatSort)      sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  async ngAfterViewInit(): Promise<void> {
    this.dataSource.sort = this.sort;
    await this.loadWeatherData();
  }

  private async loadWeatherData(): Promise<void> {
    this.loading = true;
    this.dataSource.data = [];

    const params = new URLSearchParams({
      page:      String(this.currentPage),
      page_size: String(this.pageSize),
    });

    if (this.searchTerm) {
      params.set('search', this.searchTerm);
    }

    try {
      const response = await fetch(`${this.baseurl}${this.endpoint}?${params}`, {
        method: 'GET',
      });

      const result = await response.json();

      if (response.ok) {
        const normalized: WeatherRecord[] = result.data.map((row: any) => ({
          ...row,
          precipitation: Number(row.precipitation),
          temp_max:      Number(row.temp_max),
          temp_min:      Number(row.temp_min),
          wind:          Number(row.wind),
          year:          Number(row.year),
          month:         Number(row.month),
          day:           Number(row.day),
        }));

        this.dataSource.data = normalized;
        this.totalRecords    = result.total;

        // Update paginator length without resetting current page
        if (this.paginator) {
          this.paginator.length = this.totalRecords;
        }

      } else {
        alert('Error occurred while fetching data from the backend');
      }
    } catch (error) {
      alert(`Error occurred: ${error}`);
    } finally {
      this.loading = false;
    }
  }

  /** Called by (page) event on mat-paginator */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1; // mat-paginator is 0-indexed
    this.pageSize    = event.pageSize;
    this.loadWeatherData();
  }

  /** Filters via backend search */
  applySearch(query: string): void {
    this.searchTerm  = query.trim().toLowerCase();
    this.currentPage = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadWeatherData();
  }

  /** Clears search and reloads */
  clearSearch(input: HTMLInputElement): void {
    input.value      = '';
    this.searchTerm  = '';
    this.currentPage = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadWeatherData();
  }
}