import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-register-client',
  templateUrl: './register-client.component.html',
  styleUrl: './register-client.component.css'
})
export class RegisterClientComponent {
  fullName = '';
  email = '';
  password = '';
  agreeTerms = false;

  submitting = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  private splitName(name: string): { first: string; last: string } {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { first: '', last: '' };
    }
    if (parts.length === 1) {
      return { first: parts[0], last: 'Client' };
    }
    return { first: parts[0], last: parts.slice(1).join(' ') };
  }

  onSubmit(): void {
    this.errorMessage = '';
    const name = this.fullName.trim();
    const email = this.email.trim();
    if (!name || !email || !this.password) {
      this.errorMessage = 'Please fill in name, email, and password.';
      return;
    }
    if (!this.agreeTerms) {
      this.errorMessage = 'Please accept the terms to continue.';
      return;
    }
    const { first, last } = this.splitName(name);
    const payload: User = {
      firstName: first,
      lastName: last,
      email,
      password: this.password,
      role: 'CLIENT'
    };

    this.submitting = true;
    this.userService.register(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/LoginClient']);
      },
      error: (err) => {
        this.submitting = false;
        const body = err.error;
        this.errorMessage =
          typeof body === 'string' && body.trim()
            ? body
            : body?.message || 'Registration failed. Is UserMicroService running on port 8081?';
      }
    });
  }
}
