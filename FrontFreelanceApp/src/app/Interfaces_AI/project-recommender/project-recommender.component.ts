import { Component, OnInit } from '@angular/core';
import {
  MlRecommendationService,
  RecommendedProject,
} from '../../Services/ml-recommendation.service';

@Component({
  selector: 'app-project-recommender',
  templateUrl: './project-recommender.component.html',
  styleUrls: ['./project-recommender.component.css'],
})
export class ProjectRecommenderComponent implements OnInit {
  activeTab: 'recommend' | 'train' = 'recommend';

  // ── State ──────────────────────────────────────────────────────────────────
  isLoading    = false;
  errorMsg     = '';
  successMsg   = '';
  serviceOnline = false;
  engineReady  = false;

  // ── Recommend tab ──────────────────────────────────────────────────────────
  skillsInput  = '';
  topN         = 5;
  results: RecommendedProject[] = [];
  queryUsed    = '';

  // ── Train tab ──────────────────────────────────────────────────────────────
  selectedFile: File | null = null;
  trainResult: { message: string; projects_indexed: number } | null = null;

  // ── Suggested skill tags ───────────────────────────────────────────────────
  suggestedSkills = [
    'python', 'javascript', 'react', 'angular', 'machine learning',
    'data analysis', 'web design', 'node.js', 'java', 'php',
    'wordpress', 'mobile app', 'flutter', 'sql', 'devops',
  ];
  selectedSkills: string[] = [];

  constructor(private recService: MlRecommendationService) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.recService.recommend('test', 1).subscribe({
      next: () => { this.serviceOnline = true; this.engineReady = true; },
      error: (err) => {
        this.serviceOnline = err?.status !== 0;
        this.engineReady   = err?.status !== 400 && err?.status !== 0;
        if (err?.status === 0) {
          this.errorMsg = 'ML service is offline. Start it with: python app.py (in ml-service/)';
        }
      },
    });
  }

  toggleSkill(skill: string): void {
    const idx = this.selectedSkills.indexOf(skill);
    if (idx >= 0) {
      this.selectedSkills.splice(idx, 1);
    } else {
      this.selectedSkills.push(skill);
    }
    this.skillsInput = this.selectedSkills.join(' ');
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.includes(skill);
  }

  onRecommend(): void {
    if (!this.skillsInput.trim()) {
      this.errorMsg = 'Please enter at least one skill.';
      return;
    }
    this.isLoading = true;
    this.errorMsg  = '';
    this.results   = [];

    this.recService.recommend(this.skillsInput.trim(), this.topN).subscribe({
      next: (res) => {
        this.results   = res.recommendations;
        this.queryUsed = res.query;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg  = err?.error?.error || 'Recommendation failed. Train the engine first.';
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
      ? this.recService.trainWithFile(this.selectedFile)
      : this.recService.trainDefault();

    obs.subscribe({
      next: (res) => {
        this.trainResult  = { message: res.message, projects_indexed: res.projects_indexed };
        this.successMsg   = `Engine trained on ${res.projects_indexed} projects!`;
        this.engineReady  = true;
        this.isLoading    = false;
      },
      error: (err) => {
        this.errorMsg  = err?.error?.error || 'Training failed.';
        this.isLoading = false;
      },
    });
  }

  onTabChange(tab: 'recommend' | 'train'): void {
    this.activeTab  = tab;
    this.errorMsg   = '';
    this.successMsg = '';
  }

  getScorePercent(score: number): number {
    return Math.round(score * 100);
  }

  getScoreColor(score: number): string {
    if (score >= 0.6) return '#10b981';
    if (score >= 0.3) return '#f59e0b';
    return '#6366f1';
  }

  getRatingStars(rating: number): string {
    const full  = Math.floor(rating);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }
}
