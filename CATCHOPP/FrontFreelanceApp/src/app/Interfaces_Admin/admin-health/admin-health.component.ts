import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { catchError, of } from 'rxjs';

interface ServiceHealth {
  name: string;
  url: string;
  port: number;
  status: 'UP' | 'DOWN' | 'CHECKING';
  responseTime: number | null;
  lastChecked: Date | null;
  details?: any;
}

@Component({
  selector: 'app-admin-health',
  templateUrl: './admin-health.component.html',
  styleUrls: ['./admin-health.component.css']
})
export class AdminHealthComponent implements OnInit, OnDestroy {

  services: ServiceHealth[] = [
    { name: 'Eureka Server',             url: 'http://localhost:8761/actuator/health',  port: 8761, status: 'CHECKING', responseTime: null, lastChecked: null },
    { name: 'API Gateway',               url: 'http://localhost:8079/actuator/health',  port: 8079, status: 'CHECKING', responseTime: null, lastChecked: null },
    { name: 'User MicroService',         url: 'http://localhost:8079/health/user',       port: 8081, status: 'CHECKING', responseTime: null, lastChecked: null },
    { name: 'Subscription MicroService', url: 'http://localhost:8079/health/subscription', port: 8083, status: 'CHECKING', responseTime: null, lastChecked: null },
    { name: 'Referral MicroService',     url: 'http://localhost:8079/health/referral',   port: 8085, status: 'CHECKING', responseTime: null, lastChecked: null },
    { name: 'SkillTests MicroService',   url: 'http://localhost:8079/health/skilltests', port: 8086, status: 'CHECKING', responseTime: null, lastChecked: null },
  ];

  autoRefresh = true;
  refreshInterval = 30; // seconds
  countdown = 30;
  private refreshSub?: Subscription;
  private countdownSub?: Subscription;

  get upCount(): number { return this.services.filter(s => s.status === 'UP').length; }
  get downCount(): number { return this.services.filter(s => s.status === 'DOWN').length; }
  get checkingCount(): number { return this.services.filter(s => s.status === 'CHECKING').length; }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkAll();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  checkAll(): void {
    this.services.forEach(s => this.checkService(s));
  }

  checkService(service: ServiceHealth): void {
    service.status = 'CHECKING';
    const start = Date.now();

    this.http.get<any>(service.url).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      service.responseTime = Date.now() - start;
      service.lastChecked = new Date();
      if (res && res.status === 'UP') {
        service.status = 'UP';
        service.details = res.components || null;
      } else {
        service.status = 'DOWN';
        service.details = null;
      }
    });
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.refreshSub?.unsubscribe();
      this.countdownSub?.unsubscribe();
    }
  }

  private startAutoRefresh(): void {
    this.countdown = this.refreshInterval;
    this.refreshSub = interval(this.refreshInterval * 1000).subscribe(() => {
      this.checkAll();
      this.countdown = this.refreshInterval;
    });
    this.countdownSub = interval(1000).subscribe(() => {
      if (this.countdown > 0) this.countdown--;
    });
  }

  getStatusIcon(status: string): string {
    if (status === 'UP') return '✅';
    if (status === 'DOWN') return '❌';
    return '⏳';
  }

  getResponseClass(ms: number | null): string {
    if (ms === null) return '';
    if (ms < 200) return 'fast';
    if (ms < 500) return 'medium';
    return 'slow';
  }
}
