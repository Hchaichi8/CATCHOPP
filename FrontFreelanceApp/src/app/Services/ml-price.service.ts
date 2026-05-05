import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PriceInput {
  min_price: number;
  max_price: number;
  client_average_rating: number;
  client_review_count: number;
  rate_type?: string;
}

export interface PricePrediction {
  predicted_avg_price: number;
}

export interface PricePredictResponse {
  predictions: PricePrediction[];
}

export interface PriceMetrics {
  mae: number;
  rmse: number;
  r2: number;
}

export interface PriceBenchmarkResponse {
  [modelName: string]: PriceMetrics;
}

export interface PriceTrainResponse {
  message: string;
  rows_used: number;
  benchmark: PriceBenchmarkResponse;
}

@Injectable({ providedIn: 'root' })
export class MlPriceService {
  private readonly baseUrl = 'http://localhost:8091';

  constructor(private http: HttpClient) {}

  trainWithFile(file: File): Observable<PriceTrainResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<PriceTrainResponse>(`${this.baseUrl}/price/train`, form);
  }

  trainDefault(): Observable<PriceTrainResponse> {
    return this.http.post<PriceTrainResponse>(`${this.baseUrl}/price/train`, {});
  }

  predict(data: PriceInput[], model: 'lr' | 'dt' | 'ann' = 'dt'): Observable<PricePredictResponse> {
    return this.http.post<PricePredictResponse>(`${this.baseUrl}/price/predict`, { model, data });
  }

  getBenchmark(): Observable<PriceBenchmarkResponse> {
    return this.http.get<PriceBenchmarkResponse>(`${this.baseUrl}/price/benchmark`);
  }
}
