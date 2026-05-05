import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { NotificationService, NotificationItem } from '../notification.service';
import { Subscription } from 'rxjs';

interface Toast extends NotificationItem {
  progress: number;       // 100 → 0 over 5 seconds
  timer?: any;
  progressTimer?: any;
}

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(120%)', opacity: 0 }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in',
          style({ transform: 'translateX(120%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub?: Subscription;
  private shownIds = new Set<number>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.notificationService.items$.subscribe(items => {
      const latest = items.find(i => !i.read && !this.shownIds.has(i.id));
      if (latest) {
        this.shownIds.add(latest.id);
        this.addToast(latest);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.toasts.forEach(t => { clearTimeout(t.timer); clearInterval(t.progressTimer); });
  }

  addToast(item: NotificationItem): void {
    const toast: Toast = { ...item, progress: 100 };

    // Progress bar: decrease from 100 to 0 over 5000ms (every 50ms = 1%)
    toast.progressTimer = setInterval(() => {
      toast.progress -= 1;
      if (toast.progress <= 0) {
        clearInterval(toast.progressTimer);
      }
    }, 50);

    // Auto-dismiss after 5s
    toast.timer = setTimeout(() => this.dismiss(toast.id), 5000);

    this.toasts.unshift(toast); // newest on top

    // Max 3 toasts visible
    if (this.toasts.length > 3) {
      const old = this.toasts.pop();
      if (old) { clearTimeout(old.timer); clearInterval(old.progressTimer); }
    }
  }

  dismiss(id: number): void {
    const idx = this.toasts.findIndex(t => t.id === id);
    if (idx === -1) return;
    const t = this.toasts[idx];
    clearTimeout(t.timer);
    clearInterval(t.progressTimer);
    this.toasts.splice(idx, 1);
  }

  navigate(toast: Toast): void {
    this.notificationService.markAsRead(toast.id);
    this.dismiss(toast.id);
    if (toast.relatedRoute) this.router.navigateByUrl(toast.relatedRoute);
  }

  pauseTimer(toast: Toast): void {
    clearTimeout(toast.timer);
    clearInterval(toast.progressTimer);
  }

  resumeTimer(toast: Toast): void {
    const remaining = toast.progress * 50; // ms left
    toast.progressTimer = setInterval(() => {
      toast.progress -= 1;
      if (toast.progress <= 0) clearInterval(toast.progressTimer);
    }, 50);
    toast.timer = setTimeout(() => this.dismiss(toast.id), remaining);
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      event: '📅', club: '🎯', group: '👥', system: '🔔'
    };
    return map[type] || '🔔';
  }

  getAccentColor(importance: string): string {
    const map: Record<string, string> = {
      high: '#ef4444', normal: '#198754', low: '#6b7280'
    };
    return map[importance] || '#198754';
  }

  getProgressColor(importance: string): string {
    const map: Record<string, string> = {
      high: '#ef4444', normal: '#198754', low: '#9ca3af'
    };
    return map[importance] || '#198754';
  }

  trackById(_: number, toast: Toast): number {
    return toast.id;
  }
}
