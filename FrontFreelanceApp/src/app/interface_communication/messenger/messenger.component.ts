import { Component } from '@angular/core';

interface Message {
  text: string;
  isMe: boolean;
}

interface ChatUser {
  id: number;
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
export class MessengerComponent {
  
  // Track which chat is currently open. Null means we show the list.
  activeChat: ChatUser | null = null;

  // Mock Data
  users: ChatUser[] = [
    {
      id: 1,
      name: 'Kenneth Silva',
      avatar: 'https://i.pravatar.cc/150?u=10',
      status: 'online',
      lastMsg: 'Hey, are you available for a quick call?',
      time: '12m',
      unread: true,
      history: [
        { text: 'Hi Kenneth, I saw your proposal.', isMe: true },
        { text: 'Great! I have some questions about the API.', isMe: false },
        { text: 'Sure, ask away.', isMe: true },
        { text: 'Hey, are you available for a quick call?', isMe: false }
      ]
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      avatar: 'https://i.pravatar.cc/150?u=20',
      status: 'offline',
      lastMsg: 'I sent the design files. Let me know.',
      time: '2h',
      unread: false,
      history: [
        { text: 'Did you finish the Figma mockups?', isMe: true },
        { text: 'Yes, just uploaded them.', isMe: false },
        { text: 'I sent the design files. Let me know.', isMe: false }
      ]
    }
  ];

  openChat(user: ChatUser) {
    this.activeChat = user;
  }

  goBack() {
    this.activeChat = null;
  }
}