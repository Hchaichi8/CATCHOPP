import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionInput {
  min_price: number;
  max_price: number;
  avg_price: number;
  client_average_rating: number;
  client_review_count: number;
  rate_type?: string;
}

export interface PredictionResult {
  good_match: number;
  probability_good: number;
  label: string;
}

export interface PredictionResponse {
  predictions: PredictionResult[];
}

export interface ModelMetrics {
  accuracy: number;
  f1_score: number;
  precision_0: number;
  recall_0: number;
  precision_1: number;
  recall_1: number;
}

export interface BenchmarkResponse {
  [modelName: string]: ModelMetrics;
}

export interface TrainResponse {
  message: string;
  rows_used: number;
  benchmark: BenchmarkResponse;
}

export interface PcaPoint {
  x: number;
  y: number;
  label: number;
}

export interface PcaResponse {
  points: PcaPoint[];
}

@Injectable({ providedIn: 'root' })
export class MlPredictionService {
  private readonly baseUrl = 'http://localhost:8089';

  constructor(private http: HttpClient) {}

  health(): Observable<{ status: string; models_loaded: boolean }> {
    return this.http.get<{ status: string; models_loaded: boolean }>(`${this.baseUrl}/health`);
  }

  trainWithFile(file: File): Observable<TrainResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<TrainResponse>(`${this.baseUrl}/train`, form);
  }

  trainDefault(): Observable<TrainResponse> {
    return this.http.post<TrainResponse>(`${this.baseUrl}/train`, { use_default: true });
  }

  predict(data: PredictionInput[], model: 'rf' | 'lr' | 'mlp' = 'rf'): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.baseUrl}/predict`, { model, data });
  }

  getBenchmark(): Observable<BenchmarkResponse> {
    return this.http.get<BenchmarkResponse>(`${this.baseUrl}/benchmark`);
  }

  getPcaData(): Observable<PcaResponse> {
    return this.http.get<PcaResponse>(`${this.baseUrl}/pca`);
  }
}
