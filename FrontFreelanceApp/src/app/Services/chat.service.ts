import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:8086/chat'; 
  private stompClient: Client | null = null;
  
  public messageSubject: Subject<any> = new Subject<any>();
  public updateSubject: Subject<any> = new Subject<any>(); // 🟢 NOUVEAU
  public deleteSubject: Subject<any> = new Subject<any>(); // 🟢 NOUVEAU

  constructor(private http: HttpClient) { }

  // ==========================================
  // 1. PARTIE HTTP 
  // ==========================================

  getConversations(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  getMessages(conversationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/${conversationId}`);
  }

  createConversation(user1: number, user2: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/conversation/create?user1=${user1}&user2=${user2}`, {});
  }

  // 🟢 NOUVEAU: Mettre à jour un message
  updateMessage(id: number, content: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${id}`, { content });
  }

  // 🟢 NOUVEAU: Supprimer un message
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/messages/${id}`);
  }

  // ==========================================
  // 2. PARTIE WEBSOCKET 
  // ==========================================

  connect(userId: string) {
    if (this.stompClient && this.stompClient.active) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8086/ws'), 
      debug: (str) => { console.log(str); },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('✅ Connecté au WebSocket en tant que User : ' + userId);
      
      // Écoute des nouveaux messages
      this.stompClient?.subscribe(`/user/${userId}/queue/messages`, (message: Message) => {
        if (message.body) {
          this.messageSubject.next(JSON.parse(message.body)); 
        }
      });

      // 🟢 NOUVEAU: Écoute des messages modifiés
      this.stompClient?.subscribe(`/user/${userId}/queue/updates`, (message: Message) => {
        if (message.body) {
          this.updateSubject.next(JSON.parse(message.body)); 
        }
      });

      // 🟢 NOUVEAU: Écoute des messages supprimés
      this.stompClient?.subscribe(`/user/${userId}/queue/deletes`, (message: Message) => {
        if (message.body) {
          this.deleteSubject.next(JSON.parse(message.body)); 
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Erreur WebSocket: ' + frame.headers['message']);
    };

    this.stompClient.activate();
  }

  sendMessage(chatMessage: any) {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.publish({
        destination: '/app/chat', 
        body: JSON.stringify(chatMessage)
      });
    } else {
      console.error("Impossible d'envoyer le message, WebSocket non connecté !");
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('🔌 Déconnecté du WebSocket');
    }
  }
}