import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ChatService } from '../../Services/chat.service'; 
import { UserService } from '../../Services/user.service'; 

interface Message {
  text: string;
  isMe: boolean;
}

interface ChatUser {
  id: number; 
  otherUserId: number; 
  name: string;
  avatar: string;
  status: string;
  lastMsg: string;
  time: string;
  unread: boolean;
  history: Message[];
}

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy, OnChanges {
  
  // 🟢 LA CORRECTION EST ICI : On accepte l'ID passé par le profil Freelancer
  @Input() targetUserId: string = '';

  activeChat: ChatUser | null = null;
  users: ChatUser[] = []; 
  currentUserId: number = 0;
  newMessageText: string = '';

  constructor(private chatService: ChatService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserData();

    if (this.currentUserId > 0) {
      this.chatService.connect(this.currentUserId.toString());

      this.chatService.messageSubject.subscribe((incomingMessage: any) => {
        
        const chatInList = this.users.find(u => u.id === incomingMessage.conversationId);
        
        if (chatInList) {
          chatInList.lastMsg = incomingMessage.content;
          chatInList.unread = (this.activeChat?.id !== incomingMessage.conversationId);
          chatInList.time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        if (this.activeChat && incomingMessage.conversationId === this.activeChat.id) {
          this.activeChat.history.push({
            text: incomingMessage.content,
            isMe: incomingMessage.senderId === this.currentUserId
          });
          this.scrollToBottom();
        } else if (!chatInList) {
          this.loadConversations();
        }
      });

      this.loadConversations();
    }
  }

  // 🟢 NOUVELLE MÉTHODE : Si le targetUserId change (ex: on clique sur le bouton "Message")
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetUserId'] && this.targetUserId) {
      this.openDirectChat(Number(this.targetUserId));
    }
  }

  ngOnDestroy(): void {
    // this.chatService.disconnect();
  }

  loadUserData() {
    const storedData = localStorage.getItem('currentUser');
    if (storedData) {
      let token = storedData.includes('token') ? JSON.parse(storedData).token : storedData;
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
      this.currentUserId = Number(decodedPayload.id);
    }
  }

  loadConversations() {
    this.chatService.getConversations(this.currentUserId.toString()).subscribe({
      next: (data) => {
        this.users = data.map(conv => {
          const otherId = conv.participant1Id === this.currentUserId ? conv.participant2Id : conv.participant1Id;
          
          const chatUser: ChatUser = {
            id: conv.id,
            otherUserId: otherId,
            name: 'Chargement...', 
            avatar: 'https://placehold.co/40x40/cccccc/ffffff?text=...', 
            status: 'online', 
            lastMsg: 'Cliquez pour voir les messages...',
            time: new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            unread: false,
            history: []
          };

          this.userService.getUserById(otherId.toString()).subscribe({
            next: (realUser: any) => {
              chatUser.name = `${realUser.firstName || ''} ${realUser.lastName || ''}`.trim() || 'Utilisateur inconnu';
              
              if (realUser.profilePictureUrl) {
                chatUser.avatar = realUser.profilePictureUrl;
              } else {
                chatUser.avatar = `https://ui-avatars.com/api/?name=${realUser.firstName}+${realUser.lastName}&background=random`;
              }

              // 🟢 Si on a été appelé pour ouvrir le chat directement avec cet utilisateur :
              if (this.targetUserId && Number(this.targetUserId) === chatUser.otherUserId) {
                this.openChat(chatUser);
              }
            },
            error: (err) => console.error(`Erreur chargement utilisateur ${otherId}`, err)
          });

          return chatUser;
        });
      }
    });
  }

  // 🟢 NOUVELLE FONCTION : Tente d'ouvrir directement un chat
  openDirectChat(targetId: number) {
    const existingChat = this.users.find(u => u.otherUserId === targetId);
    if (existingChat) {
      this.openChat(existingChat);
    } else {
      // Si on n'a pas encore chargé la liste, loadConversations() va le faire.
      this.loadConversations();
    }
  }

  openChat(user: ChatUser) {
    user.unread = false;
    this.activeChat = user;

    this.chatService.getMessages(user.id).subscribe({
      next: (messagesData) => {
        this.activeChat!.history = messagesData.map(msg => ({
          text: msg.content,
          isMe: msg.senderId === this.currentUserId
        }));
        this.scrollToBottom();
      }
    });
  }

  goBack() {
    this.activeChat = null;
    this.targetUserId = ''; // On réinitialise la cible
    this.loadConversations(); 
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.activeChat) return;

    const chatMessage = {
      conversationId: this.activeChat.id,
      senderId: this.currentUserId,
      recipientId: this.activeChat.otherUserId,
      content: this.newMessageText,
      timestamp: new Date()
    };

    this.chatService.sendMessage(chatMessage);

    this.activeChat.history.push({
      text: this.newMessageText,
      isMe: true
    });

    this.newMessageText = '';
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 100);
  }
}