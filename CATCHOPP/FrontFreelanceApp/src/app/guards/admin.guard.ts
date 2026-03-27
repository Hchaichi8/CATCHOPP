import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.userService.getCurrentUser();
    
    if (currentUser && currentUser.role === 'ADMIN') {
      // User is admin, allow access
      return true;
    }
    
    // Not an admin, redirect to login
    console.log('Access denied: Admin role required');
    this.router.navigate(['/LoginFreelancer'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
