import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecommendationRequest {
  skills: string;
  top_n?: number;
}

export interface RecommendedProject {
  rank: number;
  score: number;
  job_title: string;
  tags: string;
  avg_price: number;
  rate_type: string;
  client_country: string;
  client_rating: number;
}

export interface RecommendationResponse {
  recommendations: RecommendedProject[];
  query: string;
}

export interface RecTrainResponse {
  message: string;
  projects_indexed: number;
}

@Injectable({ providedIn: 'root' })
export class MlRecommendationService {
  private readonly baseUrl = 'http://localhost:8091';

  constructor(private http: HttpClient) {}

  trainWithFile(file: File): Observable<RecTrainResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<RecTrainResponse>(`${this.baseUrl}/recommend/train`, form);
  }

  trainDefault(): Observable<RecTrainResponse> {
    return this.http.post<RecTrainResponse>(`${this.baseUrl}/recommend/train`, {});
  }

  recommend(skills: string, topN: number = 5): Observable<RecommendationResponse> {
    return this.http.post<RecommendationResponse>(`${this.baseUrl}/recommend`, {
      skills,
      top_n: topN,
    });
  }
}
