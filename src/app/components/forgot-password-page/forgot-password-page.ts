import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';

interface Email{
  email:string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './forgot-password-page.html',
  styleUrls: ['./forgot-password-page.css'],
})
export class ForgotPassword {
  baseurl = 'http://127.0.0.1:8000';
  endpoint = '/forgot-password/';

  email = '';

  emailError = '';
  backError = '';
  successMessage = '';

  isSending = false;

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async sendReset(): Promise<void> {
    this.emailError = '';
    this.backError = '';
    this.successMessage = '';

    const trimmedEmail = this.email.trim();

    if (!trimmedEmail) {
      this.emailError = 'Email is required';
      return;
    }

    if (!this.emailPattern.test(trimmedEmail)) {
      this.emailError = 'Enter a valid email address';
      return;
    }

    this.isSending = true;

    try {
      const response = await fetch(`${this.baseurl}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      let result: any = {};
      try {
        result = await response.json();
      } catch {
       
      }

      if (response.status === 500) {
        alert(`Server Error: ${result?.detail ?? 'Something went wrong'}`);
        return;
      }

      if (response.status === 404) {
        this.backError = result?.detail ?? 'No account found with that email';
        return;
      }

      if (!response.ok) {
        this.backError = result?.detail ?? 'Unable to send reset link. Please try again.';
        return;
      }

      this.successMessage = 'Check your inbox for the reset link!';
      this.email = '';
    } catch (error) {
      console.log(`Error ${error}`);
      this.backError = 'Network error. Please check your connection and try again.';
    } finally {
      this.isSending = false;
    }
  }
}