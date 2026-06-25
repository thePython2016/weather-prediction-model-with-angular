import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Accountdetails {
  fname: string;
  lname: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.css',
  encapsulation: ViewEncapsulation.None
})
export class Signup implements OnInit {
  fname = '';
  lname = '';
  email = '';
  phone = '';
  address = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  fnameError = '';
  lnameError = '';
  emailError = '';
  phoneError = '';
  addressError = '';
  passwordError = '';
  confirmPasswordError = '';

  passwordHint = '';
  passwordHintType = '';
  matchHint = '';
  matchHintType = '';

  successMessage = '';
  isLoading = false;
  loadingMessage = '';

  private base = 'http://127.0.0.1:8000';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Warm up the server in background when signup page loads
    fetch(`${this.base}/create-user-account/`, {
      method: 'OPTIONS',
      credentials: 'include'
    }).catch(() => {});
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  checkPassword(): void {
    if (!this.password) { this.passwordHint = ''; this.passwordHintType = ''; return; }
    if (this.password.length < 8) {
      this.passwordHint = 'Password must be at least 8 characters';
      this.passwordHintType = 'err';
    } else {
      this.passwordHint = 'Password looks good';
      this.passwordHintType = 'ok';
    }
    this.checkMatch();
  }

  checkMatch(): void {
    if (!this.confirmPassword) { this.matchHint = ''; this.matchHintType = ''; return; }
    if (this.confirmPassword !== this.password) {
      this.matchHint = 'Passwords do not match';
      this.matchHintType = 'err';
    } else {
      this.matchHint = 'Passwords match';
      this.matchHintType = 'ok';
    }
  }

  private clearErrors(): void {
    this.fnameError = '';
    this.lnameError = '';
    this.emailError = '';
    this.phoneError = '';
    this.addressError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
  }

  async register(): Promise<void> {
    this.clearErrors();
    this.successMessage = '';

    let hasError = false;

    if (!this.fname.trim())     { this.fnameError = 'First name is required'; hasError = true; }
    if (!this.lname.trim())     { this.lnameError = 'Last name is required'; hasError = true; }
    if (!this.email.trim())     { this.emailError = 'Email is required'; hasError = true; }
    if (!this.phone.trim())     { this.phoneError = 'Phone number is required'; hasError = true; }
    if (!this.address.trim())   { this.addressError = 'Address is required'; hasError = true; }
    if (!this.password)         { this.passwordError = 'Password is required'; hasError = true; }
    if (!this.confirmPassword)  { this.confirmPasswordError = 'Please confirm your password'; hasError = true; }

    if (this.password && this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
      hasError = true;
    }
    if (this.password && this.confirmPassword && this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      hasError = true;
    }

    if (hasError) return;

    const accountData: Accountdetails = {
      fname:    this.fname.trim(),
      lname:    this.lname.trim(),
      email:    this.email.trim(),
      phone:    this.phone.trim(),
      address:  this.address.trim(),
      password: this.password
    };

    

    this.isLoading = true;
    this.loadingMessage = 'Creating your account...';

    const slowTimer = setTimeout(() => {
      this.loadingMessage = 'Server is waking up, please wait...';
    }, 3000);

    try {
      const response = await fetch(`${this.base}/create-user-account/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });

      clearTimeout(slowTimer);

      if (response.ok) {
        const created = await response.json();
        this.successMessage = created.Success || 'Account created successfully!';
        this.clearForm();  // ← add this

      } else {
        const err = await response.json();
        // console.log('Error response:', err);
        alert(`Server error: ${response.status}`);
      }
    } catch (error: any) {
      clearTimeout(slowTimer);
      alert('Could not connect to the server. Please try again.');
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }
  // Clear data after success Signup------------------------------------->
  private clearForm(): void {
    this.fname = '';
    this.lname = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.password = '';
    this.confirmPassword = '';
    this.passwordHint = '';
    this.passwordHintType = '';
    this.matchHint = '';
    this.matchHintType = '';
  }
}  // ← closing brace of class
