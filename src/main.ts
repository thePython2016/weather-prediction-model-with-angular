import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AuthService } from './app/services/auth';

bootstrapApplication(App, appConfig)
  .then(appRef => {
    const auth = appRef.injector.get(AuthService);
    auth.startKeepAlive();
  })
  .catch((err) => console.error(err));