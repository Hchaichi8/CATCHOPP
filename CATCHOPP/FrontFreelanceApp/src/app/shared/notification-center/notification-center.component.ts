import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.css'
})
export class NotificationCenterComponent {
  open = false;

  constructor(
    public notif: NotificationService,
    private router: Router
  ) {}

  toggle(): void {
    this.open = !this.open;
  }

  markRead(n: Notification, event?: Event): void {
    event?.stopPropagation();
    this.notif.markAsRead(n.id);
  }

  markAllRead(): void {
    this.notif.markAllAsRead();
  }

  onItemClick(n: Notification): void {
    this.notif.markAsRead(n.id);
    if (n.link) {
      const path = n.link.startsWith('/') ? n.link : '/' + n.link;
      this.router.navigateByUrl(path).catch(() => undefined);
      this.open = false;
    }
  }

  iconClass(type: string): string {
    switch (type) {
      case 'PROPOSAL_NEW':
        return 'fa-briefcase';
      case 'SUBSCRIPTION_EXPIRING':
        return 'fa-crown';
      case 'TEST_RESULT':
        return 'fa-graduation-cap';
      case 'REFERRAL_SIGNUP':
        return 'fa-user-plus';
      default:
        return 'fa-bell';
    }
  }

  formatDate(iso: string): string {
    if (!iso) {
      return '';
    }
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString();
  }
}
