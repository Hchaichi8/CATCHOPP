import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  userName$ = new BehaviorSubject<string>('');

  private decodeToken(): any {
    try {
      const storedData = localStorage.getItem('currentUser');
      if (!storedData) return null;
      const token = storedData.includes('token')
        ? JSON.parse(storedData).token
        : storedData;
      const payload = token.split('.')[1];
      return JSON.parse(decodeURIComponent(escape(window.atob(payload))));
    } catch {
      return null;
    }
  }

  getCurrentUserId(): number {
    const p = this.decodeToken();
    return p?.id ?? 0;
  }

  getCurrentUserEmail(): string {
    const p = this.decodeToken();
    return p?.sub ?? p?.email ?? '';
  }

  getCurrentUserRole(): string {
    const p = this.decodeToken();
    return p?.role ?? '';
  }

  getCurrentUserName(): string {
    const p = this.decodeToken();
    const name = `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim();
    if (name) this.userName$.next(name);
    return name || p?.sub || 'User';
  }

  isLoggedIn(): boolean {
    return !!this.decodeToken();
  }
}
