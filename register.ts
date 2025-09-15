import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  email = '';
  username = '';
  password = '';
  message = signal<string>('');
  validationErrors = signal<{ [key: string]: string }>({});

  // --- Password check helpers ---
  hasMinLength = (pw: string) => pw.length >= 8;
  hasUppercase = (pw: string) => /[A-Z]/.test(pw);
  hasLowercase = (pw: string) => /[a-z]/.test(pw);
  hasNumber = (pw: string) => /[0-9]/.test(pw);
  hasSpecialChar = (pw: string) => /[!@#$%^&*()_\-=\[\]{};':"\\|,.<>\/?]/.test(pw);

  // --- Field validation ---
  validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  }

  validateUsername(username: string): string | null {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters long';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  }

  validatePassword(password: string): string[] {
    const errors: string[] = [];
    if (!password) {
      errors.push('Password is required');
      return errors;
    }
    if (!this.hasMinLength(password)) errors.push('Password must be at least 8 characters long');
    if (!this.hasUppercase(password)) errors.push('Password must contain at least one uppercase letter');
    if (!this.hasLowercase(password)) errors.push('Password must contain at least one lowercase letter');
    if (!this.hasNumber(password)) errors.push('Password must contain at least one number');
    if (!this.hasSpecialChar(password)) errors.push('Password must contain at least one special character');
    return errors;
  }

  onFieldChange() {
    const errors: { [key: string]: string } = {};

    const emailError = this.validateEmail(this.email);
    if (emailError) errors['email'] = emailError;

    const usernameError = this.validateUsername(this.username);
    if (usernameError) errors['username'] = usernameError;

    const passwordErrors = this.validatePassword(this.password);
    if (passwordErrors.length > 0) errors['password'] = passwordErrors.join(', ');

    this.validationErrors.set(errors);
  }

  isFormValid(): boolean {
    return (
      Object.keys(this.validationErrors()).length === 0 &&
      !!this.email &&
      !!this.username &&
      !!this.password
    );
  }

  async submit() {
    this.message.set('');
    this.onFieldChange();

    if (!this.isFormValid()) {
      this.message.set('Please fix the validation errors before submitting.');
      return;
    }

    try {
      await this.auth.register({
        email: this.email,
        username: this.username,
        password: this.password,
      });
      this.message.set(
        'Registration successful! Please check your email to verify your account before logging in.'
      );
      // Optionally redirect:
      // this.router.navigate(['/login']);
    } catch (err: any) {
      const msg = err?.error?.message || 'Registration failed';
      this.message.set(msg);
    }
  }
}
