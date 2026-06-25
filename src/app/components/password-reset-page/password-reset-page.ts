import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './password-reset-page.html',
  styleUrl: './password-reset-page.css',
  encapsulation: ViewEncapsulation.None
})
export class ResetPassword implements OnInit {
  newPassword = '';
  confirmPassword = '';

  showNewPassword = false;
  showConfirmPassword = false;

  passwordError = '';
  confirmError = '';
  backError = '';
  successMessage = '';

  isResetting = false;

  private token = '';
  private base = 'https://weather-prediction-model-bfql.onrender.com';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // get token from URL query param e.g. /reset-password?token=abc123
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  toggleNewPassword(): void { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  private clearErrors(): void {
    this.passwordError = '';
    this.confirmError = '';
    this.backError = '';
    this.successMessage = '';
  }

  async resetPassword(): Promise<void> {
    this.clearErrors();

    if (!this.newPassword) {
      this.passwordError = 'Password is required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.confirmError = 'Passwords do not match';
      return;
    }

    this.isResetting = true;

    try {
      const response = await fetch(`${this.base}/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.token, password: this.newPassword })
      });

      const result = await response.json();

      if (response.status === 500) {
        this.backError = `Server Error: ${result.detail}`;
      } else if (response.status === 400) {
        this.backError = result.detail;
      } else if (response.status === 201 || response.status === 200) {
        this.successMessage = 'Password updated! Redirecting to signin...';
        setTimeout(() => this.router.navigate(['/signin']), 2000);
      }

    } catch (error: any) {
      this.backError = `Error: ${error.message}`;
    } finally {
      this.isResetting = false;
    }
  }
}