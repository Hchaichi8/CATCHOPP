import { Component } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-freelancer',
  templateUrl: './login-freelancer.component.html',
  styleUrls: ['./login-freelancer.component.css']
})
export class LoginFreelancerComponent {
  email: string = '';
  password: string = '';
  
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  onLogin() {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.userService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        try {
          let token = typeof response === 'string' ? response : ((response as any).token || response);
       
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
        
          if (decodedPayload.role !== 'FREELANCER') {
            this.errorMessage = "Access Denied: This portal is strictly for Freelancers. Please use the Client login portal.";
            return; 
          }

          this.successMessage = 'Login successful! Redirecting to dashboard...';
          
        
          localStorage.setItem('currentUser', JSON.stringify(response));
         
          setTimeout(() => {
            this.router.navigate(['/FreelancerFeed']); 
          }, 1500);

        } catch (e) {
          console.error("Erreur de décodage du token", e);
          this.errorMessage = "Invalid server response.";
        }
      },
      error: (err) => {
        if (err.status === 0) {
          this.errorMessage = "Cannot reach server. Check backend.";
        } else if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = "Invalid email or password.";
        }
      }
    });
  }
}