import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type EntryTab = 'manual' | 'upload';
// Data properties for the weather record, matching the backend API structure

interface WeatherRecord{
  Precipitation: number;
  Temp_Max: number;
  Temp_Min: number;
  Wind: number;
  Year: number;
  Month: number;
  Day: number;

  

}

@Component({
  selector: 'app-prediction-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './prediction-page.html',
  styleUrl: './prediction-page.css',
})
export class PredictionPage implements OnInit, AfterViewInit {

  baseurl = 'http://localhost:8000';   
  endpoint = '/prediction/';
predictedValue: string | null = null;  

  weatherForm!: FormGroup;
  activeTab: EntryTab = 'manual';

  uploadedFile: File | null = null;
  isDragOver = false;

  days = Array.from({ length: 31 }, (_, i) => i + 1);

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {}

  // Weather records from from user form.


 async ngOnInit(): Promise<void> {
    this.weatherForm = this.fb.group({
      precipitation: [null, [Validators.required, Validators.min(0)]],
      wind:          [null, [Validators.required, Validators.min(0)]],
      temp_max:      [null, Validators.required],
      temp_min:      [null, Validators.required],
      year:          [null, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      month:         [null, Validators.required],
      day:           [null, Validators.required],
    })

     
}
  
  

  ngAfterViewInit(): void {}

  setTab(tab: EntryTab): void {
    this.activeTab = tab;
  }

  // ── Manual entry ──────────────────────────────────────MANUL ENTRY --VIA API
async onSubmit():Promise<void>{
    const weatherrecords: WeatherRecord = {
    Precipitation:this.weatherForm.value.precipitation,
    Temp_Max:this.weatherForm.value.temp_max,
    Temp_Min:this.weatherForm.value.temp_min,
    Wind:this.weatherForm.value.wind,
    Year:this.weatherForm.value.year,
    Month:this.weatherForm.value.month,
    Day:this.weatherForm.value.day
    }

     try{

      const response=await fetch(`${this.baseurl}${this.endpoint}`,{
      method:'POST',
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(weatherrecords)
    
      
      
    });
    const result=await response.json()

if (response.ok) {
  this.predictedValue = result.Predicted;
 

}
    else{
      alert("Data not submitted successfully")
    }
  }
  catch (e){
    alert(`Error Occured ${e}`)
  }
}
  
    

  onReset(): void {
    this.weatherForm.reset();
  }

  // ── Upload ─────────────────────────────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File): void {
    if (!file.name.match(/\.(csv|json)$/i)) {
      this.snackBar.open('Only .csv and .json files are supported.', 'Close', { duration: 3000 });
      return;
    }
    this.uploadedFile = file;
  }

  removeFile(): void {
    this.uploadedFile = null;
  }

  onUploadSubmit(): void {
    if (!this.uploadedFile) return;
    console.log('Uploading file:', this.uploadedFile.name);
    // TODO: inject WeatherService and call service.uploadFile(this.uploadedFile)
    this.snackBar.open('File uploaded successfully!', 'Close', {
      duration: 3000,
      panelClass: ['snack-success'],
    });
    this.removeFile();
  }
}