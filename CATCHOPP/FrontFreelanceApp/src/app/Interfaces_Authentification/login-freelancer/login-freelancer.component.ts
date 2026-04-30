import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login-freelancer',
  templateUrl: './login-freelancer.component.html',
  styleUrl: './login-freelancer.component.css'
})
export class LoginFreelancerComponent {
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  loading = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    this.loading = true;

    this.userService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response && response.token) {
          console.log('Login successful! Token received.');
          
          // Get user details from token to check role
          const currentUser = this.userService.getCurrentUser();
          console.log('Current user:', currentUser);
          
          if (currentUser?.role === 'ADMIN') {
            // Redirect to admin dashboard
            console.log('Admin user detected, redirecting to admin dashboard');
            this.router.navigate(['/AdminStatistics']);
          } else {
            // Regular user - redirect to freelancer feed
            console.log('Regular user detected, redirecting to freelancer feed');
            this.router.navigate(['/FreelancerFeed']);
          }
        } else {
          console.error('Login failed: No token in response');
          this.errorMessage = 'Invalid email or password';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Make sure the backend is running.';
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 503 || error.status === 502) {
          this.errorMessage = 'Server unavailable. Please try again shortly.';
        } else {
          this.errorMessage = 'Invalid email or password';
        }
        this.loading = false;
      }
    });
  }
}
