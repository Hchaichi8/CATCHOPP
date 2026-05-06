import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api.config';

export interface JoinRequest {
  id: number;
  group: { id: number; name: string };
  userId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class JoinRequestService {
  private apiUrl = `${API_CONFIG.BASE_URL}/api/join-requests`;

  constructor(private http: HttpClient) {}

  requestJoin(groupId: number, userId: number): Observable<JoinRequest> {
    return this.http.post<JoinRequest>(this.apiUrl, { groupId, userId });
  }

  getPendingRequests(groupId: number): Observable<JoinRequest[]> {
    return this.http.get<JoinRequest[]>(`${this.apiUrl}/group/${groupId}/pending`);
  }

  getAllRequests(groupId: number): Observable<JoinRequest[]> {
    return this.http.get<JoinRequest[]>(`${this.apiUrl}/group/${groupId}`);
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${requestId}/accept`, {});
  }

  rejectRequest(requestId: number): Observable<JoinRequest> {
    return this.http.put<JoinRequest>(`${this.apiUrl}/${requestId}/reject`, {});
  }

  checkPending(groupId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check?groupId=${groupId}&userId=${userId}`);
  }
}
