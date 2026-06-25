import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const valid = await auth.verifyToken();

  document.body.style.removeProperty('display'); // ← always restore body

  if (!valid) {
    auth.clearSession();
    router.navigate(['/signin']);
    return false;
  }

  auth.startTokenInterval();
  return true;
};