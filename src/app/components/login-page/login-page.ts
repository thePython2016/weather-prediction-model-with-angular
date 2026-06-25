import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth'; // ← must match exact filename

interface Credentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  encapsulation: ViewEncapsulation.None
})
export class Login implements OnInit {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  emailError = '';
  passwordError = '';
  userError = '';
  serverError = '';

  private base = 'http://127.0.0.1:8000';

  constructor(private router: Router, private auth: AuthService) {
    const saved = localStorage.getItem('savedEmail');
    if (saved) {
      this.email = saved;
      this.rememberMe = true;
    }
  }

  ngOnInit(): void {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private clearErrors(): void {
    this.emailError = '';
    this.passwordError = '';
    this.userError = '';
    this.serverError = '';
  }

  async login(): Promise<void> {
    this.clearErrors();

    let hasError = false;

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      hasError = true;
    }
    if (!this.password) {
      this.passwordError = 'Password is required';
      hasError = true;
    }

    if (hasError) return;

    const credentials: Credentials = {
      email: this.email.trim(),
      password: this.password,
      remember_me: this.rememberMe
    };

    try {
      const response = await fetch(`${this.base}/user-authentication/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const status = await response.json();

      if (response.status === 200) {
        this.auth.setSession(status.token, status.fname, status.email); // ← store token + user
        this.auth.startTokenInterval();
        this.router.navigate(['/']);
      } else {
        this.userError = status.detail || 'Authentication failed.';
      }

    } catch (error: any) {
      this.serverError = `Error: ${error.message}`;
    }
  }
}