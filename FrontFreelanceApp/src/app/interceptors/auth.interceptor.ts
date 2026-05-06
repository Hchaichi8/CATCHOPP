import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.getToken();

    // Only attach token for our backend calls
    if (token && this.isBackendUrl(request.url)) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(request);
  }

  private getToken(): string | null {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) return null;
      // Handle both formats: raw token or { token: "..." }
      if (stored.startsWith('{')) {
        return JSON.parse(stored).token ?? null;
      }
      return stored;
    } catch (error) {
      return null;
    }
  }

  private isBackendUrl(url: string): boolean {
    return url.includes('192.168.65.136:30085') ||  // API Gateway
           url.includes('localhost:8090') ||  // CommunityMicroService direct
           url.includes('localhost:8083') ||  // UserMicroService
           url.includes('localhost:8086') ||  // Communication
           url.includes('localhost:8087');    // Support
  }
}
