import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth';

const PUBLIC_URLS = [
  '/user-authentication/',
  '/create-user-account/',
  '/forgot-password/',
  '/reset-password/'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));
  if (!token || isPublic) return next(req);

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(cloned);
};