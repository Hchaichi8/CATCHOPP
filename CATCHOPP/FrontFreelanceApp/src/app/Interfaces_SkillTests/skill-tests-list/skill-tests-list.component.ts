import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  GamificationDashboard,
  GamificationService,
  LeaguesOverview,
  TierLeaderRow,
  TierSnapshot
} from '../../services/gamification.service';
import { SkillTestService, SkillTest } from '../../services/skill-test.service';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-skill-tests-list',
  templateUrl: './skill-tests-list.component.html',
  styleUrl: './skill-tests-list.component.css'
})
export class SkillTestsListComponent implements OnInit, OnDestroy {
  categoryFilter = 'ALL';
  selectedCategory = 'Web Development';
  categories = ['Web Development', 'Design', 'Marketing', 'Data Science', 'Mobile Development'];
  tests: SkillTest[] = [];
  loading = false;
  generating = false;
  error = '';
  hasAiAccess = true;
  currentUserId: number | null = null;
  currentUserName = 'Freelancer';

  dash: GamificationDashboard | null = null;
  dashLoading = false;
  dashError = '';
  leaguesOverview: LeaguesOverview | null = null;
  overviewError = '';
  explorerTier = 'BRONZE';
  private pollSub?: Subscription;

  encourageTargetUserId: number | null = null;
  encourageText = '';
  showGifPicker = false;

  mlPrediction: { will_pass: boolean; confidence: number; message: string } | null = null;
  mlLoading = false;

  readonly gifSuggestions: string[] = [
    'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/26BRrSvJUa0cr3yRx/giphy.gif',
    'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
    'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif'
  ];

  constructor(
    private skillTestService: SkillTestService,
    private router: Router,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private gamificationService: GamificationService
  ) {}

  ngOnInit(): void {
    const u = this.userService.getCurrentUser();
    this.currentUserId = u?.id ?? null;
    this.loadTests();
    this.loadCategories();
    this.loadAiAccess();
    this.initGamification();
    this.loadLeaguesOverview();
    this.loadMlPrediction();
  }

  private loadLeaguesOverview(): void {
    this.gamificationService.getLeaguesOverview(this.currentUserId).subscribe({
      next: (o) => {
        this.leaguesOverview = o;
        if (this.dash?.leagueTier) {
          this.explorerTier = this.dash.leagueTier;
        }
      },
      error: () => {
        this.overviewError = 'Could not load league rules & leaderboards.';
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private loadAiAccess(): void {
    if (!this.currentUserId) {
      this.hasAiAccess = false;
      return;
    }
    this.subscriptionService.hasAiTestAccess(this.currentUserId).subscribe({
      next: (v) => (this.hasAiAccess = v),
      error: () => (this.hasAiAccess = false)
    });
  }

  private initGamification(): void {
    if (!this.currentUserId) {
      return;
    }
    const uid = this.currentUserId;
    this.refreshDashboard();
    this.subscriptionService.getActiveSubscription(uid).subscribe((sub) => {
      const active = !!sub && sub.status === 'ACTIVE';
      this.gamificationService.syncSubscriber(uid, active).subscribe({
        next: () => this.refreshDashboard(),
        error: () => this.refreshDashboard()
      });
    });
    this.pollSub = interval(20000)
      .pipe(switchMap(() => this.gamificationService.getDashboard(uid)))
      .subscribe({
        next: (d) => {
          this.dash = d;
          this.explorerTier = d.leagueTier;
        },
        error: () => {}
      });
  }

  refreshDashboard(): void {
    if (!this.currentUserId) {
      return;
    }
    this.dashLoading = true;
    this.dashError = '';
    this.gamificationService.getDashboard(this.currentUserId).subscribe({
      next: (d) => {
        this.dash = d;
        this.explorerTier = d.leagueTier;
        this.dashLoading = false;
      },
      error: () => {
        this.dashError = 'Could not load Arena data. Is SkillTests MS (8086) running?';
        this.dashLoading = false;
      }
    });
  }

  onMarkProfileDone(): void {
    if (!this.currentUserId) {
      return;
    }
    this.gamificationService.markProfileComplete(this.currentUserId).subscribe({
      next: () => this.refreshDashboard(),
      error: () => {}
    });
  }

  onSimulateApply(): void {
    if (!this.currentUserId) {
      return;
    }
    this.gamificationService.recordApply(this.currentUserId).subscribe({
      next: () => this.refreshDashboard(),
      error: () => {}
    });
  }

  challengePct(c: { currentCount: number; targetCount: number }): number {
    if (!c.targetCount) {
      return 0;
    }
    return Math.min(100, Math.round((100 * c.currentCount) / c.targetCount));
  }

  tierClass(tier: string): string {
    return 'tier-' + (tier || 'BRONZE').toLowerCase();
  }

  formatReset(iso: string): string {
    if (!iso) {
      return 'Monday';
    }
    try {
      return new Date(iso).toLocaleString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Monday';
    }
  }

  isMe(rowUserId: number): boolean {
    return this.currentUserId !== null && rowUserId === this.currentUserId;
  }

  avatarUrl(userId: number, url: string | null | undefined): string {
    if (url && url.trim()) {
      return url.trim();
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(userId))}`;
  }

  playerLabel(row: TierLeaderRow): string {
    return this.isMe(row.userId) ? 'You' : row.displayName || 'Freelancer #' + row.userId;
  }

  onFollow(row: TierLeaderRow): void {
    if (!this.currentUserId || this.isMe(row.userId)) {
      return;
    }
    const req = row.isFollowing
      ? this.gamificationService.unfollow(this.currentUserId, row.userId)
      : this.gamificationService.follow(this.currentUserId, row.userId);
    req.subscribe({
      next: () => this.loadLeaguesOverview(),
      error: () => {}
    });
  }

  toggleEncourage(row: TierLeaderRow): void {
    if (!this.currentUserId || this.isMe(row.userId)) {
      return;
    }
    if (this.encourageTargetUserId === row.userId) {
      this.encourageTargetUserId = null;
      this.encourageText = '';
      this.showGifPicker = false;
      return;
    }
    this.encourageTargetUserId = row.userId;
    this.encourageText = '';
    this.showGifPicker = false;
  }

  applyGif(url: string): void {
    this.encourageText = url;
    this.showGifPicker = false;
  }

  sendEncourage(row: TierLeaderRow): void {
    if (!this.currentUserId || !this.encourageText.trim()) {
      return;
    }
    this.gamificationService
      .postEncourage({
        fromUserId: this.currentUserId,
        toUserId: row.userId,
        message: this.encourageText.trim()
      })
      .subscribe({
        next: () => {
          this.encourageTargetUserId = null;
          this.encourageText = '';
          this.loadLeaguesOverview();
        },
        error: () => {}
      });
  }

  miniBoardLabel(row: { userId: number; displayName: string }): string {
    return this.isMe(row.userId) ? 'You' : row.displayName || 'Freelancer #' + row.userId;
  }

  formatBadge(code: string): string {
    return code.replace(/_/g, ' ');
  }

  tierLabel(tier: string): string {
    if (!tier) {
      return '';
    }
    return tier.charAt(0) + tier.slice(1).toLowerCase();
  }

  setExplorerTier(tier: string): void {
    this.explorerTier = tier;
  }

  get explorerSnapshot(): TierSnapshot | undefined {
    return this.leaguesOverview?.tiers?.find((t) => t.tier === this.explorerTier);
  }

  medalClass(place: number): string {
    if (place === 1) {
      return 'medal-gold';
    }
    if (place === 2) {
      return 'medal-silver';
    }
    if (place === 3) {
      return 'medal-bronze';
    }
    return '';
  }

  getDifficulty(test: SkillTest): string {
    const score = test.passScore || 70;
    if (score >= 85) return 'Hard';
    if (score >= 70) return 'Medium';
    return 'Easy';
  }

  loadTests(): void {
    this.loading = true;
    this.skillTestService.getTests().subscribe({
      next: (t: SkillTest[]) => {
        this.tests = t;
        this.loading = false;
      },
      error: () => {
        this.tests = [];
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.skillTestService.getCategories().subscribe({
      next: (c: string[]) => {
        if (c && c.length) {
          this.categories = c;
        }
      },
      error: () => {}
    });
  }

  get filteredTests(): SkillTest[] {
    if (this.categoryFilter === 'ALL') {
      return this.tests;
    }
    return this.tests.filter((t) => t.category === this.categoryFilter);
  }

  generateAiTest(): void {
    if (!this.hasAiAccess) {
      this.error = 'Premium or Enterprise subscription required for AI-generated tests.';
      return;
    }
    if (!this.currentUserId) {
      this.error = 'Log in to generate AI tests.';
      return;
    }
    this.error = '';
    this.generating = true;
    this.skillTestService
      .generateAiTest(this.currentUserId, this.selectedCategory, this.hasAiAccess, this.currentUserName)
      .subscribe({
        next: (test: SkillTest) => {
          this.generating = false;
          this.router.navigate(['/SkillTestTake', test.id]);
        },
        error: (err: unknown) => {
          this.generating = false;
          const e = err as { error?: { message?: string }; message?: string };
          this.error = e?.error?.message || e?.message || 'Failed to generate test.';
        }
      });
  }

  openAiInterview(): void {
    this.error = '';
    if (!this.currentUserId) {
      this.error = 'Log in to start an AI interview.';
      return;
    }
    if (!this.hasAiAccess) {
      this.error = 'Premium/Enterprise subscription required to use AI Interview.';
      return;
    }
    this.router.navigate(['/AIInterviewSimulator']);
  }

  loadMlPrediction(): void {
    this.mlLoading = true;

    if (!this.currentUserId) {
      // Not logged in — use default values to still show a demo prediction
      this.skillTestService.predictPass({
        tests_taken: 0,
        avg_score: 50,
        subscription: 0,
        difficulty: 2,
        time_ratio: 0.75
      }).subscribe({
        next: (result) => { this.mlPrediction = result; this.mlLoading = false; },
        error: () => { this.mlLoading = false; }
      });
      return;
    }

    this.skillTestService.getUserCertifications(this.currentUserId).subscribe({
      next: (certs) => {
        const tests_taken = certs.length;
        const avg_score = tests_taken > 0
          ? Math.round(certs.reduce((sum, c) => sum + c.score, 0) / tests_taken)
          : 50;
        const subLevel = this.hasAiAccess ? 1 : 0;
        this.skillTestService.predictPass({
          tests_taken,
          avg_score,
          subscription: subLevel,
          difficulty: 2,
          time_ratio: 0.75
        }).subscribe({
          next: (result) => { this.mlPrediction = result; this.mlLoading = false; },
          error: () => { this.mlLoading = false; }
        });
      },
      error: () => {
        // Fallback if certifications can't be fetched
        this.skillTestService.predictPass({
          tests_taken: 0,
          avg_score: 50,
          subscription: 0,
          difficulty: 2,
          time_ratio: 0.75
        }).subscribe({
          next: (result) => { this.mlPrediction = result; this.mlLoading = false; },
          error: () => { this.mlLoading = false; }
        });
      }
    });
  }

  get mlConfidencePct(): number {
    if (!this.mlPrediction) return 0;
    const c = this.mlPrediction.confidence;
    // Model returns 0-100, not 0-1
    return c > 1 ? Math.round(c) : Math.round(c * 100);
  }
}
