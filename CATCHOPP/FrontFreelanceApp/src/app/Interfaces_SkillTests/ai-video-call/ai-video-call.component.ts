import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { AiChatService, ChatMessage } from '../../services/ai-chat.service';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-ai-video-call',
  templateUrl: './ai-video-call.component.html',
  styleUrl: './ai-video-call.component.css'
})
export class AiVideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('userVideo') userVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Call state
  callActive = false;
  callDuration = 0;
  private callTimer: any;
  userIsMain = false; // false = AI is main, true = User cam is main

  // Access
  hasAccess = false;
  checkingAccess = true;

  // Voice
  isListening = false;
  isSpeaking = false;
  isMuted = false;
  isCameraOff = false;
  voiceSupported = false;
  private recognition: any = null;
  private synth = window.speechSynthesis;
  private stream: MediaStream | null = null;

  // AI state
  aiThinking = false;
  aiMouthOpen = false;
  private mouthInterval: any;
  private animFrame: any;

  // Conversation
  messages: ChatMessage[] = [];
  transcript = '';
  lastAiText = '';
  shouldScroll = false;
  textInput = '';  // text input for typing messages during call

  // Canvas animation
  private ctx!: CanvasRenderingContext2D;
  private avatarPhase = 0;

  constructor(
    private aiChatService: AiChatService,
    private subscriptionService: SubscriptionService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.voiceSupported = !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
    const userId = this.userService.getCurrentUser()?.id;
    if (userId) {
      this.subscriptionService.hasAiTestAccess(userId).subscribe({
        next: (v) => { this.hasAccess = v; this.checkingAccess = false; },
        error: () => { this.hasAccess = false; this.checkingAccess = false; }
      });
    } else {
      this.checkingAccess = false;
    }
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.endCall();
  }

  // ── Start / End Call ─────────────────────────────────────────────
  async startCall(): Promise<void> {
    this.callActive = true;
    this.callDuration = 0;
    this.callTimer = setInterval(() => this.callDuration++, 1000);
    this.messages = [];

    // Wait for Angular to render the video element
    setTimeout(async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const videoEl = this.userVideoRef?.nativeElement;
        if (videoEl) {
          videoEl.srcObject = this.stream;
          videoEl.play().catch(() => {});
        }
      } catch (err) {
        console.warn('Camera not available:', err);
      }

      // Init canvas
      if (this.canvasRef?.nativeElement) {
        this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
        this.drawAvatar();
      }
    }, 200);

    // AI greeting
    const greeting = "Hello! I'm ALO ALO, your AI career coach. I'm ready to help you with interviews, proposals, or any freelancing questions. What would you like to talk about? (Tip: say 'talk to me in Tunisian' to switch language)";
    this.lastAiText = greeting;
    this.messages.push({ role: 'assistant', content: greeting });
    this.speakAndAnimate(greeting);

    // Start watching user camera
    setTimeout(() => this.startCameraAnalysis(), 5000);
  }

  swapCameras(): void {
    this.userIsMain = !this.userIsMain;
    setTimeout(() => {
      const videoEl = this.userVideoRef?.nativeElement;
      if (videoEl && this.stream) { videoEl.srcObject = this.stream; videoEl.play().catch(() => {}); }
    }, 50);
  }

  endCall(): void {
    this.stopListening();
    this.stopSpeaking();
    clearInterval(this.callTimer);
    clearInterval(this.cameraAnalysisInterval);
    cancelAnimationFrame(this.animFrame);
    clearInterval(this.mouthInterval);
    if (this.mediaRecorder?.state === 'recording') this.mediaRecorder.stop();
    this.screenStream?.getTracks().forEach(t => t.stop());
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    this.callActive = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.aiThinking = false;
    this.isRecording = false;
    this.isScreenSharing = false;
    this.isBlurred = false;
  }

  // Camera / Mic Controls
  isBlurred = false;
  isScreenSharing = false;
  isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private screenStream: MediaStream | null = null;

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopListening();
  }

  toggleCamera(): void {
    this.isCameraOff = !this.isCameraOff;
    if (this.stream) this.stream.getVideoTracks().forEach(t => t.enabled = !this.isCameraOff);
  }

  toggleBlur(): void {
    this.isBlurred = !this.isBlurred;
    const videoEl = this.userVideoRef?.nativeElement;
    if (videoEl) {
      videoEl.style.filter = this.isBlurred ? 'blur(8px)' : 'none';
    }
  }

  async toggleScreenShare(): Promise<void> {
    if (this.isScreenSharing) {
      // Stop screen share and restore camera
      this.screenStream?.getTracks().forEach(t => t.stop());
      this.screenStream = null;
      this.isScreenSharing = false;

      // FIX: Properly restore camera stream
      const videoEl = this.userVideoRef?.nativeElement;
      if (videoEl) {
        if (this.stream) {
          videoEl.srcObject = this.stream;
          videoEl.play().catch(() => {});
        } else {
          // Re-request camera if stream was lost
          navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(newStream => {
            this.stream = newStream;
            videoEl.srcObject = newStream;
            videoEl.play().catch(() => {});
          }).catch(() => {});
        }
      }
      this.messages.push({ role: 'assistant', content: 'Screen sharing stopped. Camera restored.' });
    } else {
      try {
        this.screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        this.isScreenSharing = true;

        const videoEl = this.userVideoRef?.nativeElement;
        if (videoEl) {
          videoEl.srcObject = this.screenStream!;
          videoEl.play().catch(() => {});
        }

        // When user clicks "Stop sharing" in browser bar
        this.screenStream!.getVideoTracks()[0].onended = () => {
          this.isScreenSharing = false;
          // Restore camera
          const el = this.userVideoRef?.nativeElement;
          if (el && this.stream) { el.srcObject = this.stream; el.play().catch(() => {}); }
        };

        // Capture screenshot and send to AI after video loads
        setTimeout(() => this.captureAndDescribeScreen(), 2000);

      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
        this.isScreenSharing = false;
      }
    }
  }

  private captureAndDescribeScreen(): void {
    const videoEl = this.userVideoRef?.nativeElement;
    if (!videoEl || !this.isScreenSharing) return;

    // Draw current frame to canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(videoEl.videoWidth || 1280, 1280);
    canvas.height = Math.min(videoEl.videoHeight || 720, 720);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.7); // compress to reduce size

    // Show thinking indicator
    this.aiThinking = true;
    this.messages.push({ role: 'user', content: '[Shared screen — ALO ALO is analyzing...]' });

    // Send to backend vision API
    this.aiChatService.describeScreen(imageBase64, 'screen').subscribe({
      next: (res) => {
        this.aiThinking = false;
        // Inject screen description into conversation so AI knows what it sees
        const screenMsg = `[SCREEN_SHARE: ${res.description}]`;
        const history = [...this.messages];
        this.aiChatService.sendMessage(history, screenMsg).subscribe({
          next: (aiRes) => {
            this.messages.push({ role: 'assistant', content: aiRes.reply });
            this.speakAndAnimate(aiRes.reply);
            this.shouldScroll = true;
          },
          error: () => {
            const fallback = "I can see you're sharing your screen. What would you like help with?";
            this.messages.push({ role: 'assistant', content: fallback });
            this.speakAndAnimate(fallback);
          }
        });
      },
      error: () => {
        this.aiThinking = false;
        const fallback = "I can see you're sharing your screen. Please describe what you need help with and I'll assist you.";
        this.messages.push({ role: 'assistant', content: fallback });
        this.speakAndAnimate(fallback);
      }
    });
  }

  toggleRecording(): void {
    if (this.isRecording) {
      this.mediaRecorder?.stop();
      this.isRecording = false;
    } else {
      this.recordedChunks = [];

      // Record screen video + microphone audio combined
      const startRecording = (micStream: MediaStream | null) => {
        try {
          // Combine screen video + mic audio into one stream
          const tracks: MediaStreamTrack[] = [];

          // Add screen video track if sharing, otherwise camera
          const videoSource = this.isScreenSharing ? this.screenStream : this.stream;
          if (videoSource) {
            videoSource.getVideoTracks().forEach(t => tracks.push(t));
          }

          // Add mic audio
          if (micStream) {
            micStream.getAudioTracks().forEach(t => tracks.push(t));
          }

          if (tracks.length === 0) {
            alert('No media tracks available to record.');
            return;
          }

          const combinedStream = new MediaStream(tracks);

          // Pick best supported format
          const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'audio/webm']
            .find(t => MediaRecorder.isTypeSupported(t)) || '';

          this.mediaRecorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {});
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.recordedChunks.push(e.data);
          };
          this.mediaRecorder.onstop = () => {
            micStream?.getTracks().forEach(t => t.stop());
            this.downloadRecording();
          };
          this.mediaRecorder.start(1000);
          this.isRecording = true;
        } catch (err) {
          console.error('Recording failed:', err);
          micStream?.getTracks().forEach(t => t.stop());
          this.isRecording = false;
          alert('Recording failed. Please try again.');
        }
      };

      // Get microphone for audio
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(micStream => startRecording(micStream))
        .catch(() => startRecording(null)); // record without audio if mic denied
    }
  }

  private downloadRecording(): void {
    if (this.recordedChunks.length === 0) return;
    const hasVideo = this.recordedChunks[0].type.includes('video');
    const ext = hasVideo ? 'webm' : 'webm';
    const blob = new Blob(this.recordedChunks, { type: this.recordedChunks[0].type || 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALO-ALO-session-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.recordedChunks = [];
  }

  // ── Speech Recognition ───────────────────────────────────────────
  startListening(): void {
    if (this.isMuted || this.isSpeaking || this.aiThinking) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    this.recognition = new SR();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;  // simple: one utterance at a time
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = '';
    };

    this.recognition.onresult = (e: any) => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      this.transcript = t;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      const text = this.transcript.trim();
      if (text) {
        this.sendToAi(text);
      }
    };

    this.recognition.onerror = (e: any) => {
      console.warn('Speech error:', e.error);
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
      this.recognition = null;
    }
    this.isListening = false;
  }

  // ── AI Response ──────────────────────────────────────────────────
  sendToAi(text: string): void {
    this.messages.push({ role: 'user', content: text });
    this.transcript = '';
    this.aiThinking = true;
    this.setMood('thinking', 0);

    const lower = text.toLowerCase();

    // If user asks about mood — immediately show a mood visually before AI responds
    if (lower.includes('mood') || lower.includes('happy') || lower.includes('strict') || lower.includes('celebrate') || lower.includes('show me')) {
      this.setMood('happy', 0); // show happy while thinking
    }

    // Check if the message is asking about appearance/visual things
    const visualKeywords = ['see', 'look', 'hair', 'face', 'hand', 'gesture', 'wearing', 'shirt', 'watch', 'observe', 'describe me', 'what do i', 'five', 'wave', 'smile', 'expression', 'doing', 'holding'];
    const isVisualQuestion = visualKeywords.some(k => lower.includes(k));

    if (isVisualQuestion && !this.isCameraOff && this.stream) {
      this.captureAndAskWithImage(text);
    } else {
      const history = this.messages.slice(0, -1);
      this.aiChatService.sendMessage(history, text).subscribe({
        next: (res) => {
          this.aiThinking = false;
          this.messages.push({ role: 'assistant', content: res.reply });
          this.lastAiText = res.reply;
          this.detectMoodFromReply(res.reply);
          this.speakAndAnimate(res.reply);
        },
        error: () => {
          this.aiThinking = false;
          const err = 'Sorry, I had trouble connecting. Please try again.';
          this.messages.push({ role: 'assistant', content: err });
          this.setMood('neutral');
          this.speakAndAnimate(err);
        }
      });
    }
  }

  sendTypedMessage(): void {
    const msg = this.textInput.trim();
    if (!msg || this.aiThinking) return;
    this.textInput = '';
    this.sendToAi(msg);
  }

  onTextInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendTypedMessage();
    }
  }

  private captureAndAskWithImage(userQuestion: string): void {
    const videoEl = this.userVideoRef?.nativeElement;
    if (!videoEl) {
      // Fallback to text if no video
      this.sendTextOnly(userQuestion);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(videoEl.videoWidth || 640, 640);
    canvas.height = Math.min(videoEl.videoHeight || 480, 480);
    const ctx = canvas.getContext('2d');
    if (!ctx) { this.sendTextOnly(userQuestion); return; }

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.7);

    // Send image + question to vision API with the user's actual question
    this.aiChatService.askWithImage(imageBase64, userQuestion, this.messages.slice(0, -1)).subscribe({
      next: (res) => {
        this.aiThinking = false;
        this.messages.push({ role: 'assistant', content: res.reply });
        this.lastAiText = res.reply;
        this.detectMoodFromReply(res.reply);
        this.speakAndAnimate(res.reply);
      },
      error: () => {
        // Fallback to text
        this.sendTextOnly(userQuestion);
      }
    });
  }

  private sendTextOnly(text: string): void {
    const history = this.messages.slice(0, -1);
    this.aiChatService.sendMessage(history, text).subscribe({
      next: (res) => {
        this.aiThinking = false;
        this.messages.push({ role: 'assistant', content: res.reply });
        this.lastAiText = res.reply;
        this.detectMoodFromReply(res.reply);
        this.speakAndAnimate(res.reply);
      },
      error: () => {
        this.aiThinking = false;
        const err = 'Sorry, I had trouble connecting.';
        this.messages.push({ role: 'assistant', content: err });
        this.speakAndAnimate(err);
      }
    });
  }

  private detectMoodFromReply(reply: string): void {
    const r = reply.toLowerCase();

    // Mood keywords from AI response
    if (r.includes('🎉') || r.includes('excellent') || r.includes('great job') || r.includes('well done') || r.includes('improvement') || r.includes('celebrating') || r.includes('celebrate')) {
      this.setMood('excited', 5000);
      this.triggerReaction(['🎉', '🎊', '⭐', '🏆', '✨']);
    } else if (r.includes('😊') || r.includes('happy') || r.includes('good') || r.includes('nice') || r.includes('perfect') || r.includes('glad') || r.includes('pleased')) {
      this.setMood('happy', 4000);
      this.triggerReaction(['😊', '✨', '💫']);
    } else if (r.includes('😤') || r.includes('come on') || r.includes('lazy') || r.includes('vague') || r.includes('better than that') || r.includes('strict') || r.includes('disappointed')) {
      this.setMood('strict', 4000);
      this.triggerReaction(['😤', '💢']);
    } else if (r.includes('🤔') || r.includes('interesting') || r.includes('let me think') || r.includes('hmm') || r.includes('thinking') || r.includes('thoughtful')) {
      this.setMood('thinking', 3000);
      this.triggerReaction(['🤔', '💭']);
    } else if (r.includes('😴') || r.includes('bored') || r.includes('boring') || r.includes('again')) {
      this.setMood('neutral', 3000);
      this.triggerReaction(['😴', '💤']);
    } else if (r.includes('✋') || r.includes('high five') || r.includes('five')) {
      this.setMood('excited', 3000);
      this.triggerReaction(['✋', '🙌', '⚡', '✨', '🔥']);
    } else if (r.includes('👋') || r.includes('wave') || r.includes('hello')) {
      this.setMood('happy', 3000);
      this.triggerReaction(['👋', '😊', '✨']);
    } else if (r.includes('👍') || r.includes('thumbs up')) {
      this.setMood('happy', 3000);
      this.triggerReaction(['👍', '💪', '⭐']);
    } else if (r.includes('❤') || r.includes('love') || r.includes('amazing')) {
      this.setMood('happy', 3000);
      this.triggerReaction(['❤️', '💫', '✨', '🌟']);
    } else if (r.includes('mood') || r.includes('feeling') || r.includes('right now i')) {
      // AI is describing its mood — show happy as default
      this.setMood('happy', 4000);
      this.triggerReaction(['😊', '✨', '💫']);
    } else {
      this.setMood('neutral', 0);
    }
  }

  // ── Text-to-Speech + Avatar Animation ───────────────────────────
  private speakAndAnimate(text: string): void {
    this.stopSpeaking();
    const clean = text
      .replace(/[•*]/g, '')
      .replace(/\n/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 0.9;    // slightly slower = clearer
    utt.pitch = 1.0;
    utt.volume = 1.0;
    utt.lang = 'en-US';

    // Wait for voices to load then pick best one
    const setVoice = () => {
      const voices = this.synth.getVoices();
      // Priority: Google US English > Microsoft > any English
      const best = voices.find(v => v.name === 'Google US English')
        || voices.find(v => v.name.includes('Microsoft') && v.lang === 'en-US')
        || voices.find(v => v.lang === 'en-US' && !v.name.includes('compact'))
        || voices.find(v => v.lang.startsWith('en'));
      if (best) utt.voice = best;
    };

    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.onvoiceschanged = setVoice;
    }

    utt.onstart = () => {
      this.isSpeaking = true;
      this.startMouthAnimation();
    };
    utt.onend = () => {
      this.isSpeaking = false;
      this.aiMouthOpen = false;
      clearInterval(this.mouthInterval);
      // Do NOT auto-start listening — user must click Speak button manually
    };
    utt.onerror = () => { this.isSpeaking = false; this.aiMouthOpen = false; };

    // Small delay to avoid browser speech synthesis bug
    setTimeout(() => this.synth.speak(utt), 100);
  }

  stopSpeaking(): void {
    this.synth.cancel();
    this.isSpeaking = false;
    this.aiMouthOpen = false;
    clearInterval(this.mouthInterval);
  }

  private startMouthAnimation(): void {
    clearInterval(this.mouthInterval);
    this.mouthInterval = setInterval(() => {
      this.aiMouthOpen = !this.aiMouthOpen;
    }, 180);
  }

  // Avatar mood system
  avatarMood: 'neutral' | 'happy' | 'thinking' | 'excited' | 'strict' | 'listening' = 'neutral';
  private moodTimeout: any;

  private setMood(mood: typeof this.avatarMood, duration = 4000): void {
    this.avatarMood = mood;
    clearTimeout(this.moodTimeout);
    if (duration > 0) {
      this.moodTimeout = setTimeout(() => { this.avatarMood = 'neutral'; }, duration);
    }
  }

  // ── Canvas Avatar Drawing ────────────────────────────────────────
  private drawAvatar(): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2 - 20;
    const t = Date.now() / 1000;

    this.ctx.clearRect(0, 0, w, h);

    // Background gradient based on mood
    const bgColors: Record<string, [string, string]> = {
      neutral:   ['#1a2e2a', '#0d1a17'],
      happy:     ['#1a2e1a', '#0d1a0d'],
      thinking:  ['#1a1a2e', '#0d0d1a'],
      excited:   ['#2e1a1a', '#1a0d0d'],
      strict:    ['#2e1a0d', '#1a0d00'],
      listening: ['#1a2a2e', '#0d1a1a'],
    };
    const [c1, c2] = bgColors[this.avatarMood] || bgColors['neutral'];
    const bg = this.ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
    bg.addColorStop(0, c1);
    bg.addColorStop(1, c2);
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, w, h);

    // Floating particles when excited
    if (this.avatarMood === 'excited') {
      for (let i = 0; i < 8; i++) {
        const px = cx + Math.sin(t * 2 + i * 0.8) * 120;
        const py = cy + Math.cos(t * 1.5 + i * 0.6) * 80;
        this.ctx.beginPath();
        this.ctx.arc(px, py, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${(i * 45 + t * 60) % 360}, 80%, 70%, 0.7)`;
        this.ctx.fill();
      }
    }

    // Pulsing ring when speaking
    if (this.isSpeaking) {
      this.avatarPhase += 0.08;
      for (let r = 0; r < 3; r++) {
        const pulse = Math.sin(this.avatarPhase - r * 0.8) * 10;
        const alpha = Math.max(0, 0.4 - r * 0.12 + Math.sin(this.avatarPhase - r * 0.8) * 0.15);
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 85 + pulse + r * 15, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();
      }
    }

    // Listening ring
    if (this.isListening) {
      const pulse = Math.sin(t * 4) * 6;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 88 + pulse, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(t * 4) * 0.2})`;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }

    // Head — color based on mood
    const headColors: Record<string, [string, string]> = {
      neutral:   ['#2dd4bf', '#0d9488'],
      happy:     ['#34d399', '#059669'],
      thinking:  ['#818cf8', '#4f46e5'],
      excited:   ['#fb923c', '#ea580c'],
      strict:    ['#f87171', '#dc2626'],
      listening: ['#38bdf8', '#0284c7'],
    };
    const [hc1, hc2] = headColors[this.avatarMood] || headColors['neutral'];
    const headGrad = this.ctx.createRadialGradient(cx - 15, cy - 20, 5, cx, cy, 75);
    headGrad.addColorStop(0, hc1);
    headGrad.addColorStop(1, hc2);

    // Head bob animation
    const bobY = this.isSpeaking ? Math.sin(t * 8) * 3 : Math.sin(t * 1.5) * 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + bobY, 75, 0, Math.PI * 2);
    this.ctx.fillStyle = headGrad;
    this.ctx.fill();

    const eyeY = cy - 18 + bobY;

    // Eyes based on mood
    if (this.avatarMood === 'thinking') {
      // One eye squinting
      this.drawEye(cx - 22, eyeY, true, false);
      this.drawEye(cx + 22, eyeY, false, true);
    } else if (this.avatarMood === 'strict') {
      // Angry eyebrows
      this.drawEye(cx - 22, eyeY, false, false);
      this.drawEye(cx + 22, eyeY, false, false);
      // Angry eyebrows
      this.ctx.beginPath();
      this.ctx.moveTo(cx - 34, eyeY - 18);
      this.ctx.lineTo(cx - 10, eyeY - 14);
      this.ctx.strokeStyle = '#1a2e2a';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(cx + 10, eyeY - 14);
      this.ctx.lineTo(cx + 34, eyeY - 18);
      this.ctx.stroke();
    } else if (this.avatarMood === 'excited') {
      // Star eyes
      this.drawStarEye(cx - 22, eyeY);
      this.drawStarEye(cx + 22, eyeY);
    } else {
      // Normal eyes with blink
      const blink = Math.sin(t * 0.3) > 0.97;
      this.drawEye(cx - 22, eyeY, blink, false);
      this.drawEye(cx + 22, eyeY, blink, false);
    }

    // Mouth based on mood
    const mouthY = cy + 28 + bobY;
    this.drawMouth(cx, mouthY);

    // Thinking dots
    if (this.aiThinking) {
      const dotPhase = t * 3;
      [-16, 0, 16].forEach((dx, i) => {
        const dy = Math.sin(dotPhase + i * 1.2) * 6;
        this.ctx.beginPath();
        this.ctx.arc(cx + dx, cy + 30 + dy + bobY, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#10b981';
        this.ctx.fill();
      });
    }

    // Name tag
    const tagColor = headColors[this.avatarMood]?.[0] || '#10b981';
    this.ctx.fillStyle = tagColor + 'dd';
    this.ctx.roundRect(cx - 50, h - 52, 100, 28, 8);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 13px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('ALO ALO', cx, h - 33);

    // Status
    const statusText = this.isSpeaking ? '🔊 Speaking' : this.isListening ? '🎤 Listening' : this.aiThinking ? '💭 Thinking' : this.avatarMood === 'happy' ? '😊 Happy' : this.avatarMood === 'excited' ? '🎉 Excited!' : this.avatarMood === 'strict' ? '😤 Strict' : '● Ready';
    this.ctx.fillStyle = tagColor;
    this.ctx.font = '12px Inter, sans-serif';
    this.ctx.fillText(statusText, cx, h - 12);

    this.animFrame = requestAnimationFrame(() => this.drawAvatar());
  }

  private drawEye(x: number, y: number, blink: boolean, squint: boolean): void {
    if (blink || squint) {
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, 12, squint ? 4 : 2, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1a2e2a';
      this.ctx.fill();
      return;
    }
    // White
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, 12, 14, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    // Pupil
    this.ctx.beginPath();
    this.ctx.arc(x, y + 2, 7, 0, Math.PI * 2);
    this.ctx.fillStyle = '#1a2e2a';
    this.ctx.fill();
    // Shine
    this.ctx.beginPath();
    this.ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
    this.ctx.fill();
  }

  private drawStarEye(x: number, y: number): void {
    const t = Date.now() / 500;
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(t);
    this.ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 12 : 5;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      i === 0 ? this.ctx.moveTo(px, py) : this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawMouth(cx: number, mouthY: number): void {
    this.ctx.beginPath();
    if (this.aiMouthOpen) {
      // Open mouth (speaking)
      this.ctx.ellipse(cx, mouthY, 22, 14, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1a2e2a';
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.ellipse(cx, mouthY + 4, 18, 8, 0, 0, Math.PI);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fill();
      // Teeth
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(cx - 14, mouthY - 2, 28, 6);
    } else if (this.avatarMood === 'happy' || this.avatarMood === 'excited') {
      // Big smile
      this.ctx.arc(cx, mouthY - 8, 22, 0.1, Math.PI - 0.1);
      this.ctx.strokeStyle = '#1a2e2a';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
      // Cheeks
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 30, mouthY - 5, 10, 6, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.ellipse(cx + 30, mouthY - 5, 10, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.avatarMood === 'strict') {
      // Flat/frown
      this.ctx.arc(cx, mouthY + 10, 20, Math.PI + 0.3, -0.3);
      this.ctx.strokeStyle = '#1a2e2a';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
    } else if (this.avatarMood === 'thinking') {
      // Smirk
      this.ctx.arc(cx + 5, mouthY - 2, 15, 0.2, Math.PI - 0.5);
      this.ctx.strokeStyle = '#1a2e2a';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
    } else {
      // Neutral smile
      this.ctx.arc(cx, mouthY - 5, 20, 0.2, Math.PI - 0.2);
      this.ctx.strokeStyle = '#1a2e2a';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }
  }

  // Camera vision — ALO ALO watches you
  private cameraAnalysisInterval: any;
  cameraAnalysisEnabled = true;
  lastCameraAnalysis = 0;

  private startCameraAnalysis(): void {
    // Analyze user camera every 30 seconds — only if user hasn't spoken recently
    this.cameraAnalysisInterval = setInterval(() => {
      if (!this.callActive || this.isCameraOff || this.isScreenSharing || this.aiThinking || this.isSpeaking || this.isListening) return;
      const now = Date.now();
      if (now - this.lastCameraAnalysis < 30000) return;
      // Only auto-analyze if no messages in last 20 seconds (user is idle)
      if (this.messages.length > 0) {
        const lastMsg = this.messages[this.messages.length - 1];
        if (lastMsg.role === 'user') return; // user just spoke, don't interrupt
      }
      this.lastCameraAnalysis = now;
      this.analyzeUserCamera();
    }, 30000);
  }

  analyzeUserCameraNow(): void {
    this.lastCameraAnalysis = 0; // reset timer so it runs immediately
    this.analyzeUserCamera();
  }

  private analyzeUserCamera(): void {
    const videoEl = this.userVideoRef?.nativeElement;
    if (!videoEl || !this.stream) return;

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(videoEl.videoWidth || 640, 640);
    canvas.height = Math.min(videoEl.videoHeight || 480, 480);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.6);

    this.aiChatService.describeScreen(imageBase64, 'camera').subscribe({
      next: (res) => {
        if (!res.description || res.description.includes('not configured') || res.description.includes('No image')) return;

        const desc = res.description.toLowerCase();

        // Send the camera observation directly into the conversation
        // so the AI text model knows what it "sees"
        const cameraMsg = `[CAMERA_SNAPSHOT: ${res.description}]`;
        const history = [...this.messages];

        this.aiChatService.sendMessage(history, cameraMsg).subscribe({
          next: (aiRes) => {
            if (!aiRes.reply || aiRes.reply.includes('CAMERA_SNAPSHOT')) return;
            this.messages.push({ role: 'assistant', content: aiRes.reply });
            this.detectMoodFromReply(aiRes.reply);
            this.speakAndAnimate(aiRes.reply);
          },
          error: () => {}
        });
      },
      error: () => {}
    });
  }
  // Reaction animations
  activeReactions: { id: number; emoji: string; x: number; y: number; }[] = [];
  private reactionId = 0;

  triggerReaction(emojis: string[]): void {
    emojis.forEach((emoji, i) => {
      setTimeout(() => {
        const id = this.reactionId++;
        const x = 20 + Math.random() * 60; // % from left
        const y = 20 + Math.random() * 60; // % from top
        this.activeReactions.push({ id, emoji, x, y });
        setTimeout(() => {
          this.activeReactions = this.activeReactions.filter(r => r.id !== id);
        }, 2500);
      }, i * 150);
    });
  }

  private detectGestureAndReact(reply: string, userText: string): void {
    const r = reply.toLowerCase();
    const u = userText.toLowerCase();

    if (u.includes('five') || u.includes('high five') || r.includes('high five') || r.includes('✋')) {
      this.triggerReaction(['✋', '🙌', '⚡', '✨', '🔥']);
      this.setMood('excited', 3000);
    } else if (u.includes('wave') || r.includes('wave') || r.includes('👋')) {
      this.triggerReaction(['👋', '😊', '✨']);
      this.setMood('happy', 3000);
    } else if (u.includes('thumbs') || r.includes('👍') || r.includes('thumbs up')) {
      this.triggerReaction(['👍', '💪', '⭐']);
      this.setMood('happy', 3000);
    } else if (r.includes('🎉') || r.includes('congrat') || r.includes('excellent')) {
      this.triggerReaction(['🎉', '🎊', '⭐', '🏆', '✨']);
      this.setMood('excited', 4000);
    } else if (r.includes('❤') || r.includes('love') || r.includes('amazing')) {
      this.triggerReaction(['❤️', '💫', '✨', '🌟']);
      this.setMood('happy', 3000);
    } else if (r.includes('😤') || r.includes('come on') || r.includes('lazy')) {
      this.triggerReaction(['😤', '💢', '⚡']);
      this.setMood('strict', 3000);
    }
  }
  // ── Helpers ──────────────────────────────────────────────────────
  get callDurationFormatted(): string {
    const m = Math.floor(this.callDuration / 60).toString().padStart(2, '0');
    const s = (this.callDuration % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get recentMessages(): ChatMessage[] {
    return this.messages.slice(-6);
  }
}
