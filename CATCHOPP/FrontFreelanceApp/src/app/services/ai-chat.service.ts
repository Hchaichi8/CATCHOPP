import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private readonly API = 'http://localhost:8086/SkillTests/ai/chat';
  private readonly VISION_API = 'http://localhost:8086/SkillTests/ai/vision';

  constructor(private http: HttpClient) {}

  sendMessage(history: ChatMessage[], message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.API}/message`, { history, message });
  }

  describeScreen(imageBase64: string, type: 'screen' | 'camera' = 'screen'): Observable<{ description: string }> {
    return this.http.post<{ description: string }>(`${this.VISION_API}/describe`, { imageBase64, type });
  }

  askWithImage(imageBase64: string, question: string, history: ChatMessage[]): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.VISION_API}/ask`, { imageBase64, question, history });
  }
}
