import { Component } from '@angular/core';

interface PlanFeature {
  name: string;
  base: string;
  premium: string;
  enterprise: string;
}

@Component({
  selector: 'app-plan-comparator',
  templateUrl: './plan-comparator.component.html',
  styleUrl: './plan-comparator.component.css'
})
export class PlanComparatorComponent {
  plans = [
    { id: 1, name: 'Base', price: 9.99, popular: false },
    { id: 2, name: 'Premium', price: 24.99, popular: true },
    { id: 3, name: 'Enterprise', price: 49.99, popular: false }
  ];

  features: PlanFeature[] = [
    { name: 'Proposals / month', base: '10', premium: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Profile visibility', base: 'Basic', premium: 'Featured', enterprise: 'Custom' },
    { name: 'AI CV Generator', base: '—', premium: '10/month', enterprise: 'Unlimited' },
    { name: 'Priority support', base: '—', premium: '✓', enterprise: '✓' },
    { name: 'Analytics dashboard', base: '—', premium: '✓', enterprise: '✓' },
    { name: 'Group subscription', base: '—', premium: '—', enterprise: '✓' }
  ];
}
