import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Subject, of, switchMap, timer } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { UserService } from './user.service';

const USER_API = 'http://localhost:8079/User';

export type NotificationType =
  | 'PROPOSAL_NEW'
  | 'SUBSCRIPTION_EXPIRING'
  | 'TEST_RESULT'
  | 'REFERRAL_SIGNUP';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

interface InAppNotificationRow {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly notifications$ = new BehaviorSubject<Notification[]>([]);
  readonly unreadCount$ = new BehaviorSubject<number>(0);
  private readonly pollMs = 12000;

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService
  ) {
    this.userService.currentUser$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((user) => {
          if (!user?.id) {
            this.notifications$.next([]);
            this.unreadCount$.next(0);
            return EMPTY;
          }
          return timer(0, this.pollMs).pipe(
            switchMap(() =>
              this.http
                .get<InAppNotificationRow[]>(`${USER_API}/notifications/user/${user.id}`)
                .pipe(catchError(() => of([] as InAppNotificationRow[])))
            ),
            tap((rows) => this.applyRows(rows))
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAll(): Notification[] {
    return [...this.notifications$.value];
  }

  getUnreadCount(): number {
    return this.unreadCount$.value;
  }

  /** Immediate fetch (e.g. inbox page); polling also keeps data fresh. */
  refresh(): void {
    const user = this.userService.getCurrentUser();
    if (!user?.id) {
      return;
    }
    this.http
      .get<InAppNotificationRow[]>(`${USER_API}/notifications/user/${user.id}`)
      .pipe(catchError(() => of([] as InAppNotificationRow[])))
      .subscribe((rows) => this.applyRows(rows));
  }

  /** Inserts sample rows via User MS (for empty inbox / local testing). Safe to call multiple times. */
  seedDemoSamples(): void {
    const user = this.userService.getCurrentUser();
    if (!user?.id) {
      return;
    }
    this.http
      .post<{ created: number }>(`${USER_API}/notifications/seed/${user.id}`, {})
      .pipe(catchError(() => of({ created: 0 })))
      .subscribe(() => this.refresh());
  }

  markAsRead(id: number): void {
    const user = this.userService.getCurrentUser();
    if (!user?.id) {
      return;
    }
    this.http
      .patch<InAppNotificationRow>(`${USER_API}/notifications/${id}/read?userId=${user.id}`, {})
      .subscribe({
        next: (row) => {
          if (row && typeof row === 'object' && 'id' in row) {
            this.patchLocalRow(row as InAppNotificationRow);
          }
        },
        error: () => {}
      });
  }

  markAllAsRead(): void {
    const user = this.userService.getCurrentUser();
    if (!user?.id) {
      return;
    }
    this.http.patch<void>(`${USER_API}/notifications/user/${user.id}/read-all`, {}).subscribe({
      next: () => {
        const next = this.notifications$.value.map((n) => ({ ...n, read: true }));
        this.notifications$.next(next);
        this.unreadCount$.next(0);
      },
      error: () => {}
    });
  }

  private applyRows(rows: InAppNotificationRow[]): void {
    const mapped = (rows || []).map((r) => this.mapRow(r));
    this.notifications$.next(mapped);
    this.unreadCount$.next(mapped.filter((n) => !n.read).length);
  }

  private patchLocalRow(row: InAppNotificationRow): void {
    const next = this.notifications$.value.map((n) =>
      n.id === row.id ? this.mapRow(row) : n
    );
    this.notifications$.next(next);
    this.unreadCount$.next(next.filter((n) => !n.read).length);
  }

  private mapRow(r: InAppNotificationRow): Notification {
    return {
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.body,
      date: r.createdAt,
      read: r.read,
      link: r.link || undefined
    };
  }
}
