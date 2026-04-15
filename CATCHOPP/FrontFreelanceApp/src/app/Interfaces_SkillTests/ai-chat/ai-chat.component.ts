import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AiChatService, ChatMessage } from '../../services/ai-chat.service';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService } from '../../services/user.service';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  pinnedMessages: PinnedMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface PinnedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pinnedAt: number;
}

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css'
})
export class AiChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  // Conversation history
  conversations: Conversation[] = [];
  activeConvId: string | null = null;
  sidebarOpen = true;
  confirmDeleteId: string | null = null;
  searchQuery = '';

  // Mood system
  currentMood: 'happy' | 'thinking' | 'strict' | 'celebrating' | 'neutral' = 'neutral';
  readonly moodEmoji: Record<string, string> = {
    happy: '😊', thinking: '🤔', strict: '😤', celebrating: '🎉', neutral: '🤖'
  };
  readonly moodLabel: Record<string, string> = {
    happy: 'Happy', thinking: 'Thinking...', strict: 'Strict Mode', celebrating: 'Celebrating!', neutral: 'Ready'
  };

  // Roast mode
  roastMode = false;

  // Pinned messages panel
  showPinned = false;

  // Current chat
  messages: ChatMessage[] = [];
  inputText = '';
  loading = false;
  hasAccess = false;
  checkingAccess = true;
  error = '';
  private shouldScroll = false;

  // Voice
  isListening = false;
  isSpeaking = false;
  voiceMode = false;
  voiceSupported = false;
  speechSupported = false;
  private recognition: any = null;
  private synth = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  suggestions = [
    'How do I write a winning proposal?',
    'What should I charge as a junior developer?',
    'How do I handle a client who keeps changing requirements?',
    'Review my pitch: I am a React developer with 3 years experience',
    'How do I negotiate my rate?',
    'What makes a good freelancer profile?'
  ];

  constructor(
    private aiChatService: AiChatService,
    private subscriptionService: SubscriptionService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.voiceSupported = !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
    this.speechSupported = !!window.speechSynthesis;
    this.loadConversations();

    const userId = this.userService.getCurrentUser()?.id;
    if (userId) {
      this.subscriptionService.hasAiTestAccess(userId).subscribe({
        next: (v) => {
          this.hasAccess = v;
          this.checkingAccess = false;
          if (v && this.messages.length === 0) this.addWelcome();
        },
        error: () => { this.hasAccess = false; this.checkingAccess = false; }
      });
    } else {
      this.checkingAccess = false;
    }
  }

  ngOnDestroy(): void {
    this.stopListening();
    this.stopSpeaking();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  // ── Conversation History ─────────────────────────────────────────
  private loadConversations(): void {
    const stored = localStorage.getItem('alo_alo_conversations');
    this.conversations = stored ? JSON.parse(stored) : [];
    if (this.conversations.length > 0) {
      this.loadConversation(this.conversations[0].id);
    } else {
      this.newConversation();
    }
  }

  private saveConversations(): void {
    localStorage.setItem('alo_alo_conversations', JSON.stringify(this.conversations));
  }

  newConversation(): void {
    const conv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      pinnedMessages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.conversations.unshift(conv);
    this.saveConversations();
    this.loadConversation(conv.id);
    if (this.hasAccess) this.addWelcome();
  }

  loadConversation(id: string): void {
    this.activeConvId = id;
    const conv = this.conversations.find(c => c.id === id);
    this.messages = conv ? [...conv.messages] : [];
    this.shouldScroll = true;
    this.confirmDeleteId = null;
  }

  deleteConversation(id: string, event: Event): void {
    event.stopPropagation();
    this.conversations = this.conversations.filter(c => c.id !== id);
    this.saveConversations();
    if (this.conversations.length === 0) {
      this.newConversation();
    } else if (this.activeConvId === id) {
      this.loadConversation(this.conversations[0].id);
    }
  }

  private updateActiveConversation(): void {
    const idx = this.conversations.findIndex(c => c.id === this.activeConvId);
    if (idx === -1) return;
    this.conversations[idx].messages = [...this.messages];
    this.conversations[idx].updatedAt = Date.now();
    // Auto-title from first user message
    if (this.conversations[idx].title === 'New Chat') {
      const firstUser = this.messages.find(m => m.role === 'user');
      if (firstUser) {
        this.conversations[idx].title = firstUser.content.substring(0, 40) + (firstUser.content.length > 40 ? '...' : '');
      }
    }
    this.saveConversations();
  }

  get activeConversation(): Conversation | undefined {
    return this.conversations.find(c => c.id === this.activeConvId);
  }

  get filteredConversations(): Conversation[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }

  formatDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return d.toLocaleDateString();
  }

  // ── Voice ────────────────────────────────────────────────────────
  private checkVoiceSupport(): void {
    this.voiceSupported = !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
    this.speechSupported = !!window.speechSynthesis;
  }

  toggleListening(): void {
    if (this.isListening) { this.stopListening(); } else { this.startListening(); }
  }

  private startListening(): void {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    this.recognition = new SR();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.onstart = () => { this.isListening = true; };
    this.recognition.onresult = (event: any) => {
      let t = '';
      for (let i = event.resultIndex; i < event.results.length; i++) t += event.results[i][0].transcript;
      this.inputText = t;
    };
    this.recognition.onend = () => {
      this.isListening = false;
      if (this.voiceMode && this.inputText.trim()) setTimeout(() => this.send(), 300);
    };
    this.recognition.onerror = () => { this.isListening = false; };
    this.recognition.start();
  }

  private stopListening(): void {
    if (this.recognition) { this.recognition.stop(); this.recognition = null; }
    this.isListening = false;
  }

  speak(text: string): void {
    if (!this.speechSupported) return;
    this.stopSpeaking();
    const clean = text.replace(/•/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/<br>/g, ' ').replace(/\n/g, ' ').trim();
    this.currentUtterance = new SpeechSynthesisUtterance(clean);
    this.currentUtterance.rate = 0.95;
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;
    this.currentUtterance.lang = 'en-US';
    const voices = this.synth.getVoices();
    const preferred = voices.find(v => v.name === 'Google US English') || voices.find(v => v.lang === 'en-US');
    if (preferred) this.currentUtterance.voice = preferred;
    this.currentUtterance.onstart = () => { this.isSpeaking = true; };
    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      if (this.voiceMode && !this.loading) setTimeout(() => this.startListening(), 500);
    };
    this.currentUtterance.onerror = () => { this.isSpeaking = false; };
    this.synth.speak(this.currentUtterance);
  }

  stopSpeaking(): void {
    if (this.synth) this.synth.cancel();
    this.isSpeaking = false;
  }

  toggleVoiceMode(): void {
    this.voiceMode = !this.voiceMode;
    if (!this.voiceMode) { this.stopListening(); this.stopSpeaking(); }
  }

  // ── Mood Detection ───────────────────────────────────────────────
  private detectMood(userMessage: string, aiReply: string): void {
    const msg = userMessage.toLowerCase();
    const reply = aiReply.toLowerCase();

    if (reply.includes('🎉') || reply.includes('now that') || reply.includes('improvement') || reply.includes('excellent')) {
      this.currentMood = 'celebrating';
    } else if (reply.includes('come on') || reply.includes('lazy') || reply.includes('vague') || reply.includes('better than that') || reply.includes('😤')) {
      this.currentMood = 'strict';
    } else if (reply.includes('😊') || reply.includes('great') || reply.includes('well done') || reply.includes('good answer')) {
      this.currentMood = 'happy';
    } else {
      this.currentMood = 'neutral';
    }

    // Reset to neutral after 5 seconds
    setTimeout(() => { this.currentMood = 'neutral'; }, 5000);
  }

  // ── Roast Mode ───────────────────────────────────────────────────
  toggleRoastMode(): void {
    this.roastMode = !this.roastMode;
    const msg = this.roastMode
      ? 'roast mode on — be brutally honest and funny like a comedian'
      : 'roast mode off — back to normal coaching mode';
    this.send(msg);
  }

  // ── Pin Messages ─────────────────────────────────────────────────
  pinMessage(msg: ChatMessage): void {
    const conv = this.conversations.find(c => c.id === this.activeConvId);
    if (!conv) return;
    if (!conv.pinnedMessages) conv.pinnedMessages = [];

    const alreadyPinned = conv.pinnedMessages.some(p => p.content === msg.content);
    if (alreadyPinned) {
      conv.pinnedMessages = conv.pinnedMessages.filter(p => p.content !== msg.content);
    } else {
      conv.pinnedMessages.push({
        id: Date.now().toString(),
        content: msg.content,
        role: msg.role,
        pinnedAt: Date.now()
      });
    }
    this.saveConversations();
  }

  isPinned(msg: ChatMessage): boolean {
    const conv = this.conversations.find(c => c.id === this.activeConvId);
    return conv?.pinnedMessages?.some(p => p.content === msg.content) ?? false;
  }

  get pinnedMessages(): PinnedMessage[] {
    const conv = this.conversations.find(c => c.id === this.activeConvId);
    return conv?.pinnedMessages ?? [];
  }

  unpinMessage(pin: PinnedMessage): void {
    const conv = this.conversations.find(c => c.id === this.activeConvId);
    if (!conv) return;
    conv.pinnedMessages = conv.pinnedMessages.filter(p => p.id !== pin.id);
    this.saveConversations();
  }

  // ── Daily Tip ────────────────────────────────────────────────────
  private getDailyTip(): void {
    const lastTipDate = localStorage.getItem('alo_alo_last_tip_date');
    const today = new Date().toDateString();
    if (lastTipDate === today) return; // already shown today

    localStorage.setItem('alo_alo_last_tip_date', today);
    setTimeout(() => {
      this.aiChatService.sendMessage([], '[DAILY_TIP_REQUEST]').subscribe({
        next: (res) => {
          this.messages.push({ role: 'assistant', content: res.reply });
          this.updateActiveConversation();
          this.shouldScroll = true;
        },
        error: () => {}
      });
    }, 1500);
  }

  // ── Chat ─────────────────────────────────────────────────────────
  private addWelcome(): void {
    const text = "Hi! I'm ALO ALO, your AI career coach on CatchOPP. 👋\n\nI can help you with:\n• Preparing for client interviews\n• Writing better proposals\n• Pricing your services\n• Handling difficult clients\n• Growing your freelance career\n\nAsk me anything — I'm here to help!";
    this.messages.push({ role: 'assistant', content: text });
    this.updateActiveConversation();
    this.shouldScroll = true;
    if (this.voiceMode) this.speak(text);
    this.getDailyTip();
  }

  send(overrideText?: string): void {
    const text = (overrideText || this.inputText).trim();
    if (!text || this.loading) return;
    this.stopSpeaking();
    this.messages.push({ role: 'user', content: text });
    if (!overrideText) this.inputText = '';
    this.loading = true;
    this.currentMood = 'thinking';
    this.error = '';
    this.shouldScroll = true;
    const history = this.messages.slice(0, -1);
    this.aiChatService.sendMessage(history, text).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', content: res.reply });
        this.loading = false;
        this.shouldScroll = true;
        this.updateActiveConversation();
        this.detectMood(text, res.reply);
        if (this.voiceMode) this.speak(res.reply);
      },
      error: () => {
        const errMsg = 'Sorry, I had trouble connecting. Please try again.';
        this.messages.push({ role: 'assistant', content: errMsg });
        this.loading = false;
        this.currentMood = 'neutral';
        this.shouldScroll = true;
        this.updateActiveConversation();
      }
    });
  }

  useSuggestion(s: string): void { this.inputText = s; this.send(); }

  clearChat(): void {
    this.stopSpeaking();
    this.stopListening();
    this.messages = [];
    this.updateActiveConversation();
    this.addWelcome();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.send(); }
  }

  private scrollToBottom(): void {
    try { this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  formatMessage(text: string): string {
    return text.replace(/\n/g, '<br>').replace(/•/g, '&bull;');
  }
}
