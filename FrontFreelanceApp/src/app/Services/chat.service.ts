import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})export class ChatService {

  private apiUrl = 'http://localhost:8086/chat'; 
  private stompClient: Client | null = null;
  
 
  public messageSubject: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient) { }

  // ==========================================
  // 1. PARTIE HTTP (Historique et Conversations)
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

  // ==========================================
  // 2. PARTIE WEBSOCKET (Temps Réel)
  // ==========================================

  connect(userId: string) {
    // Si on est déjà connecté, on ne fait rien
    if (this.stompClient && this.stompClient.active) {
      return;
    }

    // Configuration du téléphone (WebSocket)
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8086/ws'), // L'URL de ton backend
      debug: (str) => {
        console.log(str); // Utile pour voir si ça se connecte bien !
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('✅ Connecté au WebSocket en tant que User : ' + userId);
      
      // 🟢 On écoute notre canal privé pour recevoir les messages des autres
      this.stompClient?.subscribe(`/user/${userId}/queue/messages`, (message: Message) => {
        if (message.body) {
          const parsedMessage = JSON.parse(message.body);
          // On envoie le nouveau message à notre composant Angular pour qu'il l'affiche
          this.messageSubject.next(parsedMessage); 
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Erreur WebSocket: ' + frame.headers['message']);
    };

    // On lance la connexion !
    this.stompClient.activate();
  }

  // Méthode pour envoyer un message en direct
  sendMessage(chatMessage: any) {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.publish({
        destination: '/app/chat', // L'URL définie dans le @MessageMapping du backend
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
