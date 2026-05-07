
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://192.168.65.136:30085/Project/notifications'; 

  constructor(private http: HttpClient) { }

  getNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  markAsRead(notifId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notifId}/read`, {});
  }
}
