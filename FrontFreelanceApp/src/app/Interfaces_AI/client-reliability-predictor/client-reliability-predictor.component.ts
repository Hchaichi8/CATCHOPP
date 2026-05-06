import { Component, OnInit } from '@angular/core';
import {
  MlPredictionService,
  PredictionInput,
  PredictionResult,
  BenchmarkResponse,
  ModelMetrics,
  PcaPoint,
} from '../../Services/ml-prediction.service';

interface FormData {
  min_price: number;
  max_price: number;
  avg_price: number;
  client_average_rating: number;
  client_review_count: number;
  rate_type: string;
}

@Component({
  selector: 'app-client-reliability-predictor',
  templateUrl: './client-reliability-predictor.component.html',
  styleUrls: ['./client-reliability-predictor.component.css'],
})
export class ClientReliabilityPredictorComponent implements OnInit {
  // ── State ──────────────────────────────────────────────────────────────────
  activeTab: 'predict' | 'train' | 'benchmark' | 'pca' = 'predict';
  selectedModel: 'rf' | 'lr' | 'mlp' = 'rf';
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  serviceOnline = false;

  // ── Predict tab ────────────────────────────────────────────────────────────
  form: FormData = {
    min_price: 100,
    max_price: 500,
    avg_price: 300,
    client_average_rating: 4.5,
    client_review_count: 10,
    rate_type: 'Fixed',
  };
  predictionResult: PredictionResult | null = null;

  // ── Train tab ──────────────────────────────────────────────────────────────
  selectedFile: File | null = null;
  trainResult: { message: string; rows_used: number } | null = null;

  // ── Benchmark tab ──────────────────────────────────────────────────────────
  benchmark: BenchmarkResponse | null = null;
  benchmarkKeys: string[] = [];

  // ── PCA tab ────────────────────────────────────────────────────────────────
  pcaPoints: PcaPoint[] = [];
  pcaReliable: PcaPoint[] = [];
  pcaUnreliable: PcaPoint[] = [];

  // ── Chart.js data (benchmark bar chart) ───────────────────────────────────
  barChartLabels: string[] = [];
  barChartDatasets: any[] = [];
  barChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { min: 0, max: 1 } },
  };

  // ── PCA scatter chart ─────────────────────────────────────────────────────
  scatterDatasets: any[] = [];
  scatterOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      x: { title: { display: true, text: 'Principal Component 1' } },
      y: { title: { display: true, text: 'Principal Component 2' } },
    },
  };

  constructor(private mlService: MlPredictionService) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  // ── Health check ──────────────────────────────────────────────────────────
  checkHealth(): void {
    this.mlService.health().subscribe({
      next: (res) => {
        this.serviceOnline = true;
        if (res.models_loaded) {
          this.loadBenchmark();
        }
      },
      error: () => {
        this.serviceOnline = false;
        this.errorMsg = 'ML service is offline. Start it with: python app.py (in ml-service/)';
      },
    });
  }

  // ── Predict ───────────────────────────────────────────────────────────────
  onPredict(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.predictionResult = null;

    const input: PredictionInput = {
      min_price: +this.form.min_price,
      max_price: +this.form.max_price,
      avg_price: +this.form.avg_price,
      client_average_rating: +this.form.client_average_rating,
      client_review_count: +this.form.client_review_count,
      rate_type: this.form.rate_type,
    };

    this.mlService.predict([input], this.selectedModel).subscribe({
      next: (res) => {
        this.predictionResult = res.predictions[0];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Prediction failed. Are models trained?';
        this.isLoading = false;
      },
    });
  }

  // ── Train ─────────────────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onTrain(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.trainResult = null;

    const obs = this.selectedFile
      ? this.mlService.trainWithFile(this.selectedFile)
      : this.mlService.trainDefault();

    obs.subscribe({
      next: (res) => {
        this.trainResult = { message: res.message, rows_used: res.rows_used };
        this.successMsg = `Training complete! ${res.rows_used} rows processed.`;
        this.isLoading = false;
        this.loadBenchmark();
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Training failed.';
        this.isLoading = false;
      },
    });
  }

  // ── Benchmark ─────────────────────────────────────────────────────────────
  loadBenchmark(): void {
    this.mlService.getBenchmark().subscribe({
      next: (res) => {
        this.benchmark = res;
        this.benchmarkKeys = Object.keys(res);
        this.buildBarChart(res);
      },
      error: () => {},
    });
  }

  buildBarChart(data: BenchmarkResponse): void {
    this.barChartLabels = Object.keys(data);
    this.barChartDatasets = [
      {
        label: 'Accuracy',
        data: this.barChartLabels.map((k) => data[k].accuracy),
        backgroundColor: 'rgba(99,102,241,0.7)',
      },
      {
        label: 'F1-Score',
        data: this.barChartLabels.map((k) => data[k].f1_score),
        backgroundColor: 'rgba(16,185,129,0.7)',
      },
    ];
  }

  getMetricPercent(val: number): string {
    return (val * 100).toFixed(1) + '%';
  }

  // ── PCA ───────────────────────────────────────────────────────────────────
  loadPca(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.mlService.getPcaData().subscribe({
      next: (res) => {
        this.pcaPoints = res.points;
        this.pcaReliable   = res.points.filter((p) => p.label === 1);
        this.pcaUnreliable = res.points.filter((p) => p.label === 0);
        this.buildScatterChart();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'PCA data unavailable.';
        this.isLoading = false;
      },
    });
  }

  buildScatterChart(): void {
    this.scatterDatasets = [
      {
        label: 'Reliable (1)',
        data: this.pcaReliable.map((p) => ({ x: p.x, y: p.y })),
        backgroundColor: 'rgba(16,185,129,0.6)',
        pointRadius: 4,
      },
      {
        label: 'Unreliable (0)',
        data: this.pcaUnreliable.map((p) => ({ x: p.x, y: p.y })),
        backgroundColor: 'rgba(239,68,68,0.5)',
        pointRadius: 4,
      },
    ];
  }

  onTabChange(tab: 'predict' | 'train' | 'benchmark' | 'pca'): void {
    this.activeTab = tab;
    this.errorMsg = '';
    this.successMsg = '';
    if (tab === 'benchmark' && !this.benchmark) this.loadBenchmark();
    if (tab === 'pca' && this.pcaPoints.length === 0) this.loadPca();
  }

  getProbabilityColor(prob: number): string {
    if (prob >= 0.75) return '#10b981';
    if (prob >= 0.5)  return '#f59e0b';
    return '#ef4444';
  }
}
