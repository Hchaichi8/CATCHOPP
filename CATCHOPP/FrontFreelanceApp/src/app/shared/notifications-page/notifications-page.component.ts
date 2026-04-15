import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css'
})
export class NotificationsPageComponent implements OnInit {
  constructor(
    public notif: NotificationService,
    public userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notif.refresh();
  }

  get loggedIn(): boolean {
    const u = this.userService.getCurrentUser();
    return !!u?.id;
  }

  markRead(n: Notification, event?: Event): void {
    event?.stopPropagation();
    this.notif.markAsRead(n.id);
  }

  markAllRead(): void {
    this.notif.markAllAsRead();
  }

  onRowClick(n: Notification): void {
    this.notif.markAsRead(n.id);
    if (n.link) {
      const path = n.link.startsWith('/') ? n.link : '/' + n.link;
      this.router.navigateByUrl(path).catch(() => undefined);
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
