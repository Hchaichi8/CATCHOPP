import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AiInterviewService } from '../../services/ai-interview.service';
import { UserService } from '../../services/user.service';
import { SubscriptionService } from '../../services/subscription.service';

type MessageRole = 'system' | 'ai' | 'user';
interface ChatMessage {
  role: MessageRole;
  text: string;
}

@Component({
  selector: 'app-ai-interview-simulator',
  templateUrl: './ai-interview-simulator.component.html',
  styleUrl: './ai-interview-simulator.component.css'
})
export class AiInterviewSimulatorComponent implements OnInit {
  projectId: number | null = null;
  projectTitle = 'Target Project';
  role = 'Freelancer';
  skillsCsv = 'communication, planning, technical execution';
  skills: string[] = [];

  sessionId: number | null = null;
  totalQuestions = 5;
  currentQuestion = 0;
  finished = false;
  finalScore: number | null = null;

  answerText = '';
  loading = false;
  subscriptionLoading = false;
  hasAiAccess = false;
  error = '';
  messages: ChatMessage[] = [];

  constructor(
    private route: ActivatedRoute,
    private aiInterviewService: AiInterviewService,
    private userService: UserService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const projectIdRaw = qp.get('projectId');
    const parsedProjectId = projectIdRaw ? Number(projectIdRaw) : null;
    this.projectId = parsedProjectId != null && Number.isFinite(parsedProjectId) ? parsedProjectId : null;
    this.projectTitle = qp.get('title') || this.projectTitle;
    this.role = qp.get('role') || this.role;
    const rawSkills = qp.get('skills') || this.skillsCsv;
    this.skillsCsv = rawSkills;
    this.skills = this.parseSkills(this.skillsCsv);

    const userId = this.userService.getCurrentUser()?.id;
    if (userId) {
      this.subscriptionLoading = true;
      this.subscriptionService.hasAiTestAccess(userId).subscribe({
        next: (v) => {
          this.hasAiAccess = v;
          this.subscriptionLoading = false;
        },
        error: () => {
          this.hasAiAccess = false;
          this.subscriptionLoading = false;
        }
      });
    }
  }

  private parseSkills(csv: string): string[] {
    return (csv || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  startInterview(): void {
    this.error = '';
    this.messages = [];
    this.finished = false;
    this.finalScore = null;
    this.answerText = '';
    this.skills = this.parseSkills(this.skillsCsv);

    const userId = this.userService.getCurrentUser()?.id;
    if (!userId) {
      this.error = 'Please log in as freelancer before starting an AI interview.';
      return;
    }
    if (!this.hasAiAccess) {
      this.error = 'Premium or Enterprise subscription is required to use AI Interview.';
      return;
    }

    this.loading = true;
    this.aiInterviewService.startInterview({
      userId,
      projectId: this.projectId ?? undefined,
      projectTitle: this.projectTitle,
      role: this.role,
      skills: this.skills,
      language: 'en'
    }).subscribe({
      next: (res) => {
        this.sessionId = res.sessionId;
        this.totalQuestions = res.totalQuestions || 5;
        this.currentQuestion = res.currentQuestionIndex || 1;
        if (res.introMessage) this.messages.push({ role: 'system', text: res.introMessage });
        if (res.firstQuestion) this.messages.push({ role: 'ai', text: res.firstQuestion });
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not start AI interview.';
        this.loading = false;
      }
    });
  }

  sendAnswer(): void {
    if (!this.sessionId || this.finished || this.loading) return;
    const text = (this.answerText || '').trim();
    if (!text) return;

    this.messages.push({ role: 'user', text });
    this.answerText = '';
    this.loading = true;
    this.error = '';

    this.aiInterviewService.answer({ sessionId: this.sessionId, answer: text }).subscribe({
      next: (res) => {
        this.currentQuestion = res.questionIndex || this.currentQuestion;
        if (res.feedback) {
          this.messages.push({ role: 'ai', text: res.feedback });
        }
        if (res.finished) {
          this.finished = true;
          this.finalScore = res.finalScore ?? null;
        } else if (res.nextQuestion) {
          this.messages.push({ role: 'ai', text: res.nextQuestion });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not send answer.';
        this.loading = false;
      }
    });
  }

  retryInterview(): void {
    this.sessionId = null;
    this.finished = false;
    this.finalScore = null;
    this.messages = [];
    this.answerText = '';
    this.currentQuestion = 0;
    this.error = '';
  }

  getScoreClass(): string {
    if (this.finalScore === null) return 'score-neutral';
    if (this.finalScore >= 80) return 'score-excellent';
    if (this.finalScore >= 60) return 'score-good';
    if (this.finalScore >= 40) return 'score-average';
    return 'score-poor';
  }

  getScoreVerdict(): string {
    if (this.finalScore === null) return '';
    if (this.finalScore >= 80) return 'Excellent! You are ready to apply.';
    if (this.finalScore >= 60) return 'Good performance. A bit more practice and you\'re ready.';
    if (this.finalScore >= 40) return 'Average. Review the feedback and practice again.';
    return 'Needs improvement. Read the feedback carefully and try again.';
  }
}
