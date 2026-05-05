import { Component, OnInit } from '@angular/core';
import {
  MlPriceService,
  PriceInput,
  PriceBenchmarkResponse,
  PriceMetrics,
} from '../../Services/ml-price.service';

interface PriceForm {
  min_price: number;
  max_price: number;
  client_average_rating: number;
  client_review_count: number;
  rate_type: string;
}

@Component({
  selector: 'app-price-predictor',
  templateUrl: './price-predictor.component.html',
  styleUrls: ['./price-predictor.component.css'],
})
export class PricePredictorComponent implements OnInit {
  activeTab: 'predict' | 'train' | 'benchmark' = 'predict';
  selectedModel: 'lr' | 'dt' | 'ann' = 'dt';
  isLoading    = false;
  errorMsg     = '';
  successMsg   = '';
  serviceOnline = false;

  // ── Predict tab ────────────────────────────────────────────────────────────
  form: PriceForm = {
    min_price: 100,
    max_price: 500,
    client_average_rating: 4.2,
    client_review_count: 8,
    rate_type: 'Fixed',
  };
  predictedPrice: number | null = null;

  // ── Train tab ──────────────────────────────────────────────────────────────
  selectedFile: File | null = null;
  trainResult: { message: string; rows_used: number } | null = null;

  // ── Benchmark tab ──────────────────────────────────────────────────────────
  benchmark: PriceBenchmarkResponse | null = null;
  benchmarkKeys: string[] = [];

  // ── Chart data ─────────────────────────────────────────────────────────────
  barChartLabels: string[] = [];
  barChartDatasets: any[] = [];
  barChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { beginAtZero: true } },
  };

  constructor(private priceService: MlPriceService) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.priceService.getBenchmark().subscribe({
      next: () => { this.serviceOnline = true; this.loadBenchmark(); },
      error: (err) => {
        this.serviceOnline = err?.status !== 0;
        if (err?.status === 0) {
          this.errorMsg = 'ML service is offline. Start it with: python app.py (in ml-service/)';
        }
      },
    });
  }

  onPredict(): void {
    this.isLoading     = true;
    this.errorMsg      = '';
    this.predictedPrice = null;

    const input: PriceInput = {
      min_price:              +this.form.min_price,
      max_price:              +this.form.max_price,
      client_average_rating:  +this.form.client_average_rating,
      client_review_count:    +this.form.client_review_count,
      rate_type:              this.form.rate_type,
    };

    this.priceService.predict([input], this.selectedModel).subscribe({
      next: (res) => {
        this.predictedPrice = res.predictions[0].predicted_avg_price;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg  = err?.error?.error || 'Prediction failed. Train the models first.';
        this.isLoading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  onTrain(): void {
    this.isLoading  = true;
    this.errorMsg   = '';
    this.successMsg = '';
    this.trainResult = null;

    const obs = this.selectedFile
      ? this.priceService.trainWithFile(this.selectedFile)
      : this.priceService.trainDefault();

    obs.subscribe({
      next: (res) => {
        this.trainResult = { message: res.message, rows_used: res.rows_used };
        this.successMsg  = `Training complete! ${res.rows_used} rows processed.`;
        this.isLoading   = false;
        this.loadBenchmark();
      },
      error: (err) => {
        this.errorMsg  = err?.error?.error || 'Training failed.';
        this.isLoading = false;
      },
    });
  }

  loadBenchmark(): void {
    this.priceService.getBenchmark().subscribe({
      next: (res) => {
        this.benchmark      = res;
        this.benchmarkKeys  = Object.keys(res);
        this.buildBarChart(res);
      },
      error: () => {},
    });
  }

  buildBarChart(data: PriceBenchmarkResponse): void {
    this.barChartLabels = Object.keys(data);
    this.barChartDatasets = [
      {
        label: 'MAE ($)',
        data: this.barChartLabels.map((k) => data[k].mae),
        backgroundColor: 'rgba(239,68,68,0.7)',
      },
      {
        label: 'RMSE ($)',
        data: this.barChartLabels.map((k) => data[k].rmse),
        backgroundColor: 'rgba(245,158,11,0.7)',
      },
    ];
  }

  onTabChange(tab: 'predict' | 'train' | 'benchmark'): void {
    this.activeTab  = tab;
    this.errorMsg   = '';
    this.successMsg = '';
    if (tab === 'benchmark' && !this.benchmark) this.loadBenchmark();
  }

  getPriceCategory(price: number): { label: string; color: string } {
    if (price < 200)  return { label: 'Low Budget',    color: '#10b981' };
    if (price < 1000) return { label: 'Mid Range',     color: '#f59e0b' };
    return               { label: 'High Value',     color: '#6366f1' };
  }

  getR2Color(r2: number): string {
    if (r2 >= 0.8) return '#10b981';
    if (r2 >= 0.5) return '#f59e0b';
    return '#ef4444';
  }
}
