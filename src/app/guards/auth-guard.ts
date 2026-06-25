import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);

  const valid = await auth.verifyToken();

  if (!valid) {
    auth.handleUnauthorized();
    return false;
  }

  document.body.style.setProperty('display', 'block', 'important');
  auth.startTokenInterval();
  return true;
};