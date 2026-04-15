import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API = 'http://localhost:8082/Project/ai/analyze-scope';

export interface ProjectScopeAnalysis {
  quality: string;
  missing: string[];
  unrealisticNotes: string[];
  suggestions: string[];
  readyToPost: boolean;
  headline: string;
  aiUsed: boolean;
  engine: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectScopeService {
  constructor(private http: HttpClient) {}

  analyzeScope(title: string, description: string): Observable<ProjectScopeAnalysis> {
    return this.http.post<ProjectScopeAnalysis>(API, { title: title ?? '', description: description ?? '' });
  }
}
