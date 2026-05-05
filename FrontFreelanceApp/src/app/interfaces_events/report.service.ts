import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api.config';

export interface CommunityReport {
  id: number;
  reporterId: number;
  targetType: 'POST' | 'COMMENT';
  targetId: number;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${API_CONFIG.BASE_URL}/api/reports`;

  constructor(private http: HttpClient) {}

  createReport(reporterId: number, targetType: 'POST' | 'COMMENT', targetId: number, reason: string): Observable<CommunityReport> {
    return this.http.post<CommunityReport>(this.apiUrl, { reporterId, targetType, targetId, reason });
  }

  getPendingReports(): Observable<CommunityReport[]> {
    return this.http.get<CommunityReport[]>(`${this.apiUrl}/pending`);
  }

  getAllReports(): Observable<CommunityReport[]> {
    return this.http.get<CommunityReport[]>(this.apiUrl);
  }

  deleteReportedContent(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}/delete-content`);
  }

  dismissReport(reportId: number): Observable<CommunityReport> {
    return this.http.put<CommunityReport>(`${this.apiUrl}/${reportId}/dismiss`, {});
  }
}
