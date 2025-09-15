import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  username = '';
  newPassword = '';
  confirmPassword = '';
  message = signal<string>('');

  hasMinLength = (pw: string) => pw.length >= 8;
  hasUppercase = (pw: string) => /[A-Z]/.test(pw);
  hasLowercase = (pw: string) => /[a-z]/.test(pw);
  hasNumber = (pw: string) => /[0-9]/.test(pw);
  hasSpecial = (pw: string) => /[!@#$%^&*()_\-=[\]{};':"\\|,.<>\/?]/.test(pw);

  async submit() {
    this.message.set('');
    if (!this.username || !this.newPassword || !this.confirmPassword) {
      this.message.set('All fields are required');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.message.set('Passwords do not match');
      return;
    }
    const checks = [
      this.hasMinLength(this.newPassword),
      this.hasUppercase(this.newPassword),
      this.hasLowercase(this.newPassword),
      this.hasNumber(this.newPassword),
      this.hasSpecial(this.newPassword)
    ];
    if (checks.includes(false)) {
      this.message.set('Password must be 8+ chars with uppercase, lowercase, number, and symbol');
      return;
    }
    try {
      await this.auth.resetPassword({ username: this.username, newPassword: this.newPassword });
      this.message.set('Password reset successful. You can log in now.');
      setTimeout(() => this.router.navigateByUrl('/login'), 800);
    } catch (err: any) {
      const msg = err?.error?.message || 'Failed to reset password';
      this.message.set(msg);
    }
  }
}


