import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api.config';

export interface GroupMember {
  id?: number;
  group?: { id: number };
  userId: number;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt?: string;
}

export interface GroupMemberDTO {
  id: number;
  groupId: number;
  userId: number;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePictureUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class GroupMemberService {
  private apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GROUP_MEMBERS}`;

  constructor(private http: HttpClient) {}

  getAllMembers(): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(this.apiUrl);
  }

  getMemberById(id: number): Observable<GroupMember> {
    return this.http.get<GroupMember>(`${this.apiUrl}/${id}`);
  }

  getMembersByGroupId(groupId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.apiUrl}/group/${groupId}`);
  }

  // Returns members enriched with user info from UserMicroService
  getEnrichedMembersByGroupId(groupId: number): Observable<GroupMemberDTO[]> {
    return this.http.get<GroupMemberDTO[]>(`${this.apiUrl}/group/${groupId}/enriched`);
  }

  getMembersByUserId(userId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.apiUrl}/user/${userId}`);
  }

  addMember(member: GroupMember): Observable<GroupMember> {
    return this.http.post<GroupMember>(this.apiUrl, member);
  }

  updateMemberRole(id: number, member: GroupMember): Observable<GroupMember> {
    return this.http.put<GroupMember>(`${this.apiUrl}/${id}`, member);
  }

  removeMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  countMembersByGroupId(groupId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/group/${groupId}/count`);
  }
}
