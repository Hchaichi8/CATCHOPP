import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ChatService } from '../../Services/chat.service'; 
import { UserService } from '../../Services/user.service'; 

interface Message {
  id?: number;
  text: string;
  isMe: boolean;
  isEditing?: boolean;
  showMenu?: boolean;
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

      // 1. Écouter les nouveaux messages
      this.chatService.messageSubject.subscribe((incomingMessage: any) => {
        const chatInList = this.users.find(u => u.id === incomingMessage.conversationId);
        
        if (chatInList) {
          chatInList.lastMsg = incomingMessage.content;
          chatInList.unread = (this.activeChat?.id !== incomingMessage.conversationId);
          chatInList.time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        if (this.activeChat && incomingMessage.conversationId === this.activeChat.id) {
          // Évite les doublons si le message a déjà été ajouté localement
          if (!this.activeChat.history.find(m => m.id === incomingMessage.id)) {
            this.activeChat.history.push({
              id: incomingMessage.id,
              text: incomingMessage.content,
              isMe: incomingMessage.senderId === this.currentUserId
            });
            this.scrollToBottom();
          }
        } else if (!chatInList) {
          this.loadConversations();
        }
      });

      // 2. Écouter les mises à jour (Édition)
      this.chatService.updateSubject.subscribe((updatedMsg: any) => {
        if (this.activeChat && updatedMsg.conversationId === this.activeChat.id) {
           const msg = this.activeChat.history.find(m => m.id === updatedMsg.id);
           if (msg) msg.text = updatedMsg.content;
        }
      });

      // 3. Écouter les suppressions
      this.chatService.deleteSubject.subscribe((deleteData: any) => {
        if (this.activeChat && deleteData.conversationId === this.activeChat.id) {
           this.activeChat.history = this.activeChat.history.filter(m => m.id !== deleteData.deletedId);
        }
      });

      this.loadConversations();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetUserId'] && this.targetUserId) {
      this.openDirectChat(Number(this.targetUserId));
    }
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
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

  openDirectChat(targetId: number) {
    const existingChat = this.users.find(u => u.otherUserId === targetId);
    if (existingChat) {
      this.openChat(existingChat);
    } else {
      this.loadConversations();
    }
  }

  openChat(user: ChatUser) {
    user.unread = false;
    this.activeChat = user;

    this.chatService.getMessages(user.id).subscribe({
      next: (messagesData) => {
        this.activeChat!.history = messagesData.map(msg => ({
          id: msg.id, // On stocke l'ID venant de la DB
          text: msg.content,
          isMe: msg.senderId === this.currentUserId
        }));
        this.scrollToBottom();
      }
    });
  }

  goBack() {
    this.activeChat = null;
    this.targetUserId = ''; 
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
    
    

    this.newMessageText = '';
    this.scrollToBottom();
  }


  
  toggleMenu(msg: Message) {
    this.activeChat?.history.forEach(m => { if(m !== msg) m.showMenu = false; });
    msg.showMenu = !msg.showMenu;
  }

  deleteMsg(msg: Message) {
    if (msg.id) {
      this.chatService.deleteMessage(msg.id).subscribe();
    }
  }

  editMsg(msg: Message) {
    msg.isEditing = true;
    msg.showMenu = false;
  }

  saveEdit(msg: Message, newText: string) {
    if (!msg.id || !newText.trim()) {
      msg.isEditing = false;
      return;
    }
    this.chatService.updateMessage(msg.id, newText).subscribe();
    msg.isEditing = false;
  }

  cancelEdit(msg: Message) {
    msg.isEditing = false;
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