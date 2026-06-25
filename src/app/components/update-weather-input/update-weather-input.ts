import { Component, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';

export interface WeatherRecord {
  id: number;
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
  selector: 'app-update-weather-input',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './update-weather-input.html',
  styleUrl: './update-weather-input.css',
})
export class UpdateWeatherInput implements AfterViewInit {
  baseurl  = 'http://localhost:8000';
  endpoint = '/weatherdata/';
  endpointdelete = '/delete-weather-data/';

  displayedColumns: string[] = [
    'precipitation', 'temp_max', 'temp_min',
    'wind', 'year', 'month', 'day', 'weather'
  ];

  dataSource = new MatTableDataSource<WeatherRecord>([]);
  selectedRow: WeatherRecord | null = null;

  isLoading  = true;
  loadError  = false;

  totalRecords = 0;
  currentPage  = 1;
  pageSize     = 10;
  searchTerm   = '';

  showEditModal     = false;
  editingRow: WeatherRecord | null = null;
  editDraft: WeatherRecord = {} as WeatherRecord;
  isSaving          = false;

  showDeleteConfirm = false;
  rowToDelete: WeatherRecord | null = null;
  isDeleting        = false;

  toast: { message: string; type: 'success' | 'error' } | null = null;

  @ViewChild(MatSort)      sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  async ngAfterViewInit(): Promise<void> {
    this.dataSource.sort = this.sort;
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading       = true;
    this.dataSource.data = [];

    const params = new URLSearchParams({
      page:      String(this.currentPage),
      page_size: String(this.pageSize),
    });

    if (this.searchTerm) params.set('search', this.searchTerm);

    try {
      const response = await fetch(`${this.baseurl}${this.endpoint}?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

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
      if (this.paginator) this.paginator.length = this.totalRecords;

    } catch (error) {
      console.error('Failed to load weather data:', error);
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
  }

  // ── Pagination ──────────────────────────────────────

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize    = event.pageSize;
    this.selectedRow = null;
    this.loadData();
  }

  // ── Search ──────────────────────────────────────────

  applySearch(value: string): void {
    this.searchTerm  = value.trim().toLowerCase();
    this.currentPage = 1;
    this.selectedRow = null;
    if (this.paginator) this.paginator.firstPage();
    this.loadData();
  }

  clearSearch(input: HTMLInputElement): void {
    input.value      = '';
    this.searchTerm  = '';
    this.currentPage = 1;
    this.selectedRow = null;
    if (this.paginator) this.paginator.firstPage();
    this.loadData();
  }

  // ── Row Selection ───────────────────────────────────

  selectRow(row: WeatherRecord): void {
    this.selectedRow = this.selectedRow?.id === row.id ? null : row;
  }

  isSelected(row: WeatherRecord): boolean {
    return this.selectedRow?.id === row.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showEditModal || this.showDeleteConfirm) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.table-card') && !target.closest('.floating-actions')) {
      this.selectedRow = null;
    }
  }

  // ── Edit Modal ──────────────────────────────────────

  openEditModal(row: WeatherRecord, event?: Event): void {
    event?.stopPropagation();
    this.editingRow    = row;
    this.editDraft     = { ...row };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingRow    = null;
    this.editDraft     = {} as WeatherRecord;
    this.isSaving      = false;
  }

  async saveEdit(): Promise<void> {
    if (!this.editingRow || this.isSaving) return;
    this.isSaving = true;

    const payload = {
      precipitation: this.editDraft.precipitation,
      max_temp:      this.editDraft.temp_max,
      min_temp:      this.editDraft.temp_min,
      wind:          this.editDraft.wind,
      year:          this.editDraft.year,
      month:         this.editDraft.month,
      day:           this.editDraft.day,
      weather:       this.editDraft.weather,
    };

    try {
      const response = await fetch(`${this.baseurl}/update-weather-data/${this.editingRow.id}/`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      this.closeEditModal();
      this.selectedRow = null;
      this.showToast('Record updated successfully.', 'success');
      await this.loadData();

    } catch (error) {
      console.error('Failed to update record:', error);
      this.showToast('Failed to update record.', 'error');
      this.isSaving = false;
    }
  }

  // ── Delete Modal ────────────────────────────────────

  confirmDelete(row: WeatherRecord, event?: Event): void {
    event?.stopPropagation();
    this.rowToDelete       = row;
    this.showDeleteConfirm = true;
  }

  async deleteRow(): Promise<void> {
    if (!this.rowToDelete || this.isDeleting) return;
    this.isDeleting = true;

    try {
      const response = await fetch(`${this.baseurl}${this.endpointdelete}${this.rowToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      if (this.selectedRow?.id === this.rowToDelete.id) this.selectedRow = null;
      this.rowToDelete       = null;
      this.showDeleteConfirm = false;
      this.showToast('Record deleted successfully.', 'success');
      await this.loadData();

    } catch (error) {
      console.error('Failed to delete record:', error);
      this.showToast('Failed to delete record.', 'error');
    } finally {
      this.isDeleting = false;
    }
  }

  cancelDelete(): void {
    this.rowToDelete       = null;
    this.showDeleteConfirm = false;
  }

  // ── Toast ───────────────────────────────────────────

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
  }
}