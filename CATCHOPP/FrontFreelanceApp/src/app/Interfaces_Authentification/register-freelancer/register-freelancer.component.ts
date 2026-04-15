import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { ReferralService } from '../../services/referral.service';
import { PromoCodeService } from '../../services/promo-code.service';

@Component({
  selector: 'app-register-freelancer',
  templateUrl: './register-freelancer.component.html',
  styleUrl: './register-freelancer.component.css'
})
export class RegisterFreelancerComponent implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  agreeToTerms = false;
  errorMessage = '';
  loading = false;
  referralCode: string | null = null;
  showReferralBanner = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private referralService: ReferralService,
    private promoCodeService: PromoCodeService
  ) {}

  ngOnInit(): void {
    // Check for referral code in URL query params
    this.route.queryParams.subscribe(params => {
      const refCode = params['ref'];
      if (refCode) {
        this.referralCode = refCode;
        this.showReferralBanner = true;
        // Store in localStorage in case user refreshes page
        localStorage.setItem('referral_code', refCode);
      } else {
        // Check if there's a stored referral code
        const storedCode = localStorage.getItem('referral_code');
        if (storedCode) {
          this.referralCode = storedCode;
          this.showReferralBanner = true;
        }
      }
    });
  }

  onRegister(): void {
    this.errorMessage = '';

    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (!this.agreeToTerms) {
      this.errorMessage = 'You must agree to the Terms of Service';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.loading = true;

    const user: User = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: 'FREELANCER'
    };

    this.userService.register(user).subscribe({
      next: (response) => {
        if (response && response.id) {
          const newUserId = response.id;
          
          // If there's a referral code, track the referral
          if (this.referralCode) {
            this.referralService.useReferralCode(this.referralCode, newUserId).subscribe({
              next: () => {
                console.log('Referral tracked successfully');
                // Clear stored referral code
                localStorage.removeItem('referral_code');
              },
              error: (err) => {
                console.error('Failed to track referral:', err);
              }
            });
          }

          // Give new user a welcome discount (20% off)
          this.giveWelcomeDiscount(newUserId);
          
          alert('Registration successful! You received a 20% welcome discount! Please login.');
          this.router.navigate(['/LoginFreelancer']);
        } else {
          this.errorMessage = 'Registration failed. Email may already be in use.';
          this.loading = false;
        }
      },
      error: (error) => {
        const body = error.error;
        this.errorMessage =
          typeof body === 'string' && body.trim()
            ? body
            : body?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  private giveWelcomeDiscount(userId: number): void {
    // Create a welcome promo code for the new user
    const welcomeCode: Partial<any> = {
      code: `WELCOME${userId}`,
      type: 'SPECIAL' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      userId: userId,
      earnedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      isActive: true,
      minSubscriptionCount: 0,
      description: 'Welcome to CatchOPP! 20% off your first subscription'
    };

    this.promoCodeService.createPromoCode(welcomeCode as any).subscribe({
      next: () => {
        console.log('Welcome discount created');
      },
      error: (err) => {
        console.error('Failed to create welcome discount:', err);
      }
    });
  }
}
