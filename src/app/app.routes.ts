import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home } from './components/home/home';
import { AddWeatherInput } from './components/add-weather-input/add-weather-input';
import { UpdateWeatherInput } from './components/update-weather-input/update-weather-input';
import { ViewWeatherInput } from './components/view-weather-input/view-weather-input';
import { PredictionPage } from './components/prediction-page/prediction-page';
import { WeatherByRegionPage } from './components/weather-by-region-page/weather-by-region-page';
import { WeatherByDayPage } from './components/weather-by-day-page/weather-by-day-page';
import { WeatherByMonthPage } from './components/weather-by-month-page/weather-by-month-page';
import { ChartsPage } from './components/charts-page/charts-page';
import { ReportPage } from './components/report-page/report-page';
import {Login} from './components/login-page/login-page';
import {Signup} from './components/signup-page/signup-page'
import { ForgotPassword } from './components/forgot-password-page/forgot-password-page';
import { ResetPassword } from './components/password-reset-page/password-reset-page';
import { authGuard } from './guards/auth-guard';




export const routes: Routes = [
   { path: 'signin', component: Login },
   { path: 'signup', component: Signup },
   { path: 'forgot-password', component: ForgotPassword },
   { path: 'reset-password', component: ResetPassword },
   
  {
    // Protected pages ------------------------------------------------------------------>
    path: '',
    component: Layout,
    canActivate: [authGuard], 
    children: [
      { path: '',                     component: Home },
      { path: 'add-weather-input',    component: AddWeatherInput },
      { path: 'update-weather-input', component: UpdateWeatherInput },
      { path: 'view-weather-input',   component: ViewWeatherInput },
      { path: 'prediction',           component: PredictionPage },
      { path: 'weather-by-region',    component: WeatherByRegionPage },
      { path: 'weather-by-day',       component: WeatherByDayPage },
      { path: 'weather-by-month',     component: WeatherByMonthPage },
      { path: 'charts',               component: ChartsPage },
      { path: 'reports',              component: ReportPage },
      // { path: 'login',              component: Login },

    ]
  }
];