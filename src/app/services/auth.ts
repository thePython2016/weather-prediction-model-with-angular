import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;  
  private intervalId: any = null;
  private keepAliveId: any = null;
  private readonly TOKEN_KEY = 'session_token';
  private readonly NAME_KEY  = 'fname';
  private readonly EMAIL_KEY = 'email';

  constructor(private router: Router) {}

  setSession(token: string, fname: string, email: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.NAME_KEY,  fname);
    sessionStorage.setItem(this.EMAIL_KEY, email);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): { name: string; email: string } | null {
    const name  = sessionStorage.getItem(this.NAME_KEY);
    const email = sessionStorage.getItem(this.EMAIL_KEY);
    if (!name || !email) return null;
    return { name, email };
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.NAME_KEY);
    sessionStorage.removeItem(this.EMAIL_KEY);
  }

  handleUnauthorized(): void {
    this.clearSession();
    this.router.navigate(['/signin']);
  }

  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${this.base}/verify-token/`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  startTokenInterval(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(async () => {
      const valid = await this.verifyToken();
      if (!valid) this.handleUnauthorized();
    }, 30000);
  }

  stopTokenInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  startKeepAlive(): void {
    if (this.keepAliveId) return;
    this.keepAliveId = setInterval(async () => {
      try {
        const token = this.getToken();
        if (!token) return;
        await fetch(`${this.base}/verify-token/`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {}
    }, 14 * 60 * 1000);
  }

  stopKeepAlive(): void {
    if (this.keepAliveId) {
      clearInterval(this.keepAliveId);
      this.keepAliveId = null;
    }
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    try {
      if (token) {
        await fetch(`${this.base}/logout/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch {
      // even if the backend call fails, proceed with client-side cleanup
    } finally {
      this.stopTokenInterval();
      this.stopKeepAlive();
      this.clearSession();
      this.router.navigate(['/signin']);
    }
  }
}