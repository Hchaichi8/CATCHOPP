import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8086/SkillTests/ai/interview';

export interface StartInterviewRequest {
  userId: number;
  projectId?: number;
  projectTitle: string;
  role: string;
  skills: string[];
  language?: string;
}

export interface InterviewSessionDto {
  sessionId: number;
  introMessage: string;
  firstQuestion: string;
  totalQuestions: number;
  currentQuestionIndex: number;
}

export interface AnswerInterviewRequest {
  sessionId: number;
  answer: string;
}

export interface InterviewTurnResponseDto {
  sessionId: number;
  questionIndex: number;
  nextQuestion: string | null;
  feedback: string | null;
  finished: boolean;
  finalScore: number | null;
}

@Injectable({ providedIn: 'root' })
export class AiInterviewService {
  constructor(private http: HttpClient) {}

  startInterview(payload: StartInterviewRequest): Observable<InterviewSessionDto> {
    return this.http.post<InterviewSessionDto>(`${API}/start`, payload);
  }

  answer(payload: AnswerInterviewRequest): Observable<InterviewTurnResponseDto> {
    return this.http.post<InterviewTurnResponseDto>(`${API}/answer`, payload);
  }
}
