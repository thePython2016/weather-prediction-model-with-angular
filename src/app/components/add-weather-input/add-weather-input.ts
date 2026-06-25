import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// TODO: import { HttpClient } from '@angular/common/http'; — then add provideHttpClient() in app.config.ts
 interface WeatherData{

    
    precipitation: number;
    tempMax: number;
    tempMin: number;
    windSpeed: number;
    weather: string;
    month: number;
    day: number;
    year: number

  
  }
@Component({
  selector: 'app-add-weather-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-weather-input.html',
  styleUrl: './add-weather-input.css',
})
export class AddWeatherInput implements OnInit {
  baseUrl = 'http://localhost:8000';   // ✅ declared at class level
  endPoint = '/user-data/';

  activeTab: 'manual' | 'upload' = 'manual';
  isDragOver = false;
  uploadedFile: File | null = null;
  weatherForm!: FormGroup;

  // private apiUrl = 'http://localhost:8000'; // TODO: move to environment.ts

  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  weatherTypes = [
    { value: 'sun',     label: 'Sunny',   icon: 'bi-sun' },
    { value: 'rain',    label: 'Rainy',   icon: 'bi-cloud-rain' },
    { value: 'cloudy',  label: 'Cloudy',  icon: 'bi-cloud' },
    { value: 'drizzle', label: 'Drizzle', icon: 'bi-cloud-drizzle' },
    { value: 'fog',     label: 'Foggy',   icon: 'bi-cloud-fog2' },
    { value: 'snow',    label: 'Snow',    icon: 'bi-snow' },
    { value: 'storm',   label: 'Stormy',  icon: 'bi-cloud-lightning-rain' },
  ];

  constructor(private fb: FormBuilder) {} // TODO: add private http: HttpClient
      // DATA posting to POSTGRES DB via API  INTEGRATION GOES HERE----------------------POST----------->
    // Defined interface for the weather data
 
  // Data object to be sent to the API------------>

 

  ngOnInit(): void {
    this.weatherForm = this.fb.group({
 
      precipitation: [null, [Validators.required, Validators.min(0)]],
      temp_max:      [null, Validators.required],
      temp_min :      [null, Validators.required],
      weather_type:  [null, Validators.required],
      wind:          [null, [Validators.required, Validators.min(0)]],
      year:          [null, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      month:         [null, Validators.required],
      day:           [null, Validators.required],
    });
  }



  // daata submission function to send the weather data to POSTGRES database through the API


onSubmit =async()=>{

   const WeatherInput:WeatherData={
    precipitation: this.weatherForm.value.precipitation,
    tempMax: this.weatherForm.value.temp_max,
    tempMin: this.weatherForm.value.temp_min,
    windSpeed: this.weatherForm.value.wind,
    weather: this.weatherForm.value.weather_type,
    year: this.weatherForm.value.year,
    month: this.weatherForm.value.month,
    day: this.weatherForm.value.day
}

   
  
  try{
  const response=await fetch(`${this.baseUrl}${this.endPoint}`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(WeatherInput)

  })

const result=await response.json()
if(response.ok){
  alert("Data submitted successfully!")
}
else{
  alert(`Error Occured ${result.detail}`)
}
}
  catch(error)
  {
    alert(`Error Occured ${error}`)
  }
}




  setTab(tab: 'manual' | 'upload'): void {
    this.activeTab = tab;
  }


  onReset(): void {
    this.weatherForm.reset();
  }

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
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadedFile = file;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.uploadedFile = input.files[0];
  }

  removeFile(): void {
    this.uploadedFile = null;
  }

  onUploadSubmit(): void {
    if (!this.uploadedFile) return;
    // TODO: POST this.uploadedFile as FormData to `${this.apiUrl}/weather/upload/` using this.http.post(...)
    console.log('Uploading file:', this.uploadedFile.name);
  }

  getWeatherIcon(value: string | null): string {
    return this.weatherTypes.find(w => w.value === value)?.icon ?? 'bi-cloud';
  }

  getWeatherLabel(value: string | null): string {
    return this.weatherTypes.find(w => w.value === value)?.label ?? '';
  }
}