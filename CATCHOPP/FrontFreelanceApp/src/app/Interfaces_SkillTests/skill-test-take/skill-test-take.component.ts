import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SkillTestService, SkillTest, Question, Certification } from '../../services/skill-test.service';

@Component({
  selector: 'app-skill-test-take',
  templateUrl: './skill-test-take.component.html',
  styleUrl: './skill-test-take.component.css'
})
export class SkillTestTakeComponent implements OnInit, OnDestroy {
  testId = 0;
  testTitle = '';
  testDurationMinutes = 10;
  currentIndex = 0;
  answers: Record<number, string> = {};
  questions: Question[] = [];
  loading = true;
  submitting = false;
  currentUserId = 1;
  currentUserName = 'Freelancer';

  // Timer
  timeLeft = 0;
  totalTime = 0;
  private timerInterval: any;
  timerWarning = false;
  timerDanger = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private skillTestService: SkillTestService
  ) {}

  ngOnInit(): void {
    this.testId = +this.route.snapshot.paramMap.get('id')!;
    this.loadTestAndQuestions();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  loadTestAndQuestions(): void {
    this.loading = true;
    this.skillTestService.getTest(this.testId).subscribe({
      next: (test: SkillTest) => {
        this.testTitle = test.title;
        this.testDurationMinutes = test.durationMinutes || 10;
        this.skillTestService.getQuestions(this.testId).subscribe({
          next: (q: Question[]) => {
            this.questions = q;
            this.loading = false;
            this.startTimer();
          },
          error: () => { this.questions = []; this.loading = false; }
        });
      },
      error: () => { this.testTitle = 'Skill Test'; this.questions = []; this.loading = false; }
    });
  }

  private startTimer(): void {
    this.totalTime = this.testDurationMinutes * 60;
    this.timeLeft = this.totalTime;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.timerWarning = this.timeLeft <= this.totalTime * 0.3;
      this.timerDanger = this.timeLeft <= 60;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.submit(); // auto-submit
      }
    }, 1000);
  }

  get timerMinutes(): number { return Math.floor(this.timeLeft / 60); }
  get timerSeconds(): string { return (this.timeLeft % 60).toString().padStart(2, '0'); }

  get timerCircleDash(): number {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    return circumference * (this.timeLeft / this.totalTime);
  }

  get timerCircleTotal(): number {
    return 2 * Math.PI * 28;
  }

  get timerColor(): string {
    if (this.timerDanger) return '#ef4444';
    if (this.timerWarning) return '#f59e0b';
    return '#10b981';
  }

  selectAnswer(qId: number, option: string): void {
    this.answers[qId] = option;
  }

  next(): void {
    if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
  }

  prev(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  submit(): void {
    if (this.questions.length === 0) return;
    clearInterval(this.timerInterval);
    this.submitting = true;
    this.skillTestService.submitTest(
      this.currentUserId, this.testId, this.answers, this.currentUserName
    ).subscribe({
      next: (cert: Certification) => {
        this.submitting = false;
        this.router.navigate(['/SkillTestResult', this.testId], {
          queryParams: { score: cert.score, passed: cert.passed, title: this.testTitle }
        });
      },
      error: () => { this.submitting = false; }
    });
  }

  get progress(): number {
    return this.questions.length ? ((this.currentIndex + 1) / this.questions.length) * 100 : 0;
  }

  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }
}
