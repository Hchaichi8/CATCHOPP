import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AvataaarsState,
  ACCESSORIES,
  BG_COLORS,
  CLOTHES_COLORS,
  CLOTHING,
  EYEBROWS,
  EYES,
  FACIAL_HAIR,
  HAIR_COLORS,
  HAIR_TOPS,
  MOUTHS,
  SKIN_SWATCHES,
  buildAvataaarsUrl,
  defaultAvataaarsState,
  mergeAvataaarsState,
  parseAvataaarsUrl
} from './avataaars-studio';
import {
  EncouragementView,
  FollowingUser,
  GamificationService,
  LeaguePublicProfile,
  WeeklyXpSeries
} from '../../services/gamification.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-league-profile',
  templateUrl: './league-profile.component.html',
  styleUrl: './league-profile.component.css'
})
export class LeagueProfileComponent implements OnInit {
  profileUserId!: number;
  currentUserId: number | null = null;
  profile: LeaguePublicProfile | null = null;
  loading = true;
  error = '';

  following: FollowingUser[] = [];
  followingLoading = false;

  followers: FollowingUser[] = [];
  followersLoading = false;

  weeklyXp: WeeklyXpSeries | null = null;
  weeklyXpLoading = false;

  comments: EncouragementView[] = [];
  private commentsPage = 0;
  commentsTotalPages = 0;
  commentsLoading = false;
  commentsHasMore = true;

  editingEncouragementId: number | null = null;
  editingMessage = '';
  editSaving = false;
  deleteLoadingId: number | null = null;

  encourageText = '';
  postingEncourage = false;
  showGifPicker = false;

  editDraft = { displayName: '', location: '' };
  savingProfile = false;

  /** Full-screen avatar creator (DiceBear avataaars). */
  avatarModalOpen = false;
  studioTab: 'skin' | 'hair' | 'face' | 'clothes' | 'extras' = 'skin';
  studioState: AvataaarsState = defaultAvataaarsState('0');

  // Upload photo to generate an avatar (photo-derived DiceBear seed).
  photoBase64: string | null = null;
  photoMimeType: string | null = null;
  photoPreviewUrl: string | null = null;
  photoTransforming = false;
  photoTransformStatus = '';
  styleIntensity = 70;
  genderPreference: 'auto' | 'male' | 'female' | 'neutral' = 'auto';
  aiTransformUsed = false;
  aiTransformEngine = '';
  cameraOpen = false;
  cameraBusy = false;
  private cameraStream: MediaStream | null = null;

  readonly skinSwatches = SKIN_SWATCHES;
  readonly hairTops = HAIR_TOPS;
  readonly hairColors = HAIR_COLORS;
  readonly eyes = EYES;
  readonly eyebrows = EYEBROWS;
  readonly mouths = MOUTHS;
  readonly facialHairOpts = FACIAL_HAIR;
  readonly clothing = CLOTHING;
  readonly clothesColors = CLOTHES_COLORS;
  readonly accessories = ACCESSORIES;
  readonly bgColors = BG_COLORS;

  readonly reactionPalette = ['👍', '❤️', '🔥', '👏', '😂', '🎉', '✨', '💪', '🙌', '⭐'];

  // Quick GIF choices (public URLs). Users can also paste a GIF URL in the textarea.
  readonly gifSuggestions: string[] = [
    'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/26BRrSvJUa0cr3yRx/giphy.gif',
    'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
    'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private gamification: GamificationService
  ) {}

  ngOnInit(): void {
    const u = this.userService.getCurrentUser();
    this.currentUserId = u?.id ?? null;
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('userId');
      if (!id) {
        this.router.navigate(['/SkillTests']);
        return;
      }
      this.profileUserId = +id;
      if (Number.isNaN(this.profileUserId)) {
        this.router.navigate(['/SkillTests']);
        return;
      }
      this.resetAndLoad();
    });
  }

  get isOwnProfile(): boolean {
    return this.currentUserId !== null && this.currentUserId === this.profileUserId;
  }

  resetAndLoad(): void {
    this.loading = true;
    this.profile = null;
    this.error = '';
    this.following = [];
    this.followers = [];
    this.weeklyXp = null;
    this.comments = [];
    this.commentsPage = 0;
    this.commentsHasMore = true;

    this.gamification.getPublicProfile(this.profileUserId, this.currentUserId).subscribe({
      next: (p) => {
        this.profile = p;
        this.editDraft = { displayName: p.displayName || '', location: p.location || '' };
        this.syncStudioFromProfile(p);
        this.loading = false;
        this.loadFollowing();
        if (this.isOwnProfile) {
          this.loadFollowers();
        }
        this.loadWeeklyXpSeries();
        this.loadCommentsPage(true);
      },
      error: () => {
        this.error = 'Could not load this league profile. Is SkillTests (8086) running?';
        this.loading = false;
      }
    });
  }

  private syncStudioFromProfile(p: LeaguePublicProfile): void {
    const seed = String(this.profileUserId);
    const parsed = p.avatarUrl ? parseAvataaarsUrl(p.avatarUrl) : null;
    this.studioState = mergeAvataaarsState(seed, parsed);
  }

  openAvatarModal(): void {
    if (!this.isOwnProfile || !this.profile) {
      return;
    }
    this.syncStudioFromProfile(this.profile);
    this.studioTab = 'skin';
    this.photoBase64 = null;
    this.photoMimeType = null;
    this.photoPreviewUrl = null;
    this.photoTransforming = false;
    this.photoTransformStatus = '';
    this.styleIntensity = 70;
    this.genderPreference = 'auto';
    this.aiTransformUsed = false;
    this.aiTransformEngine = '';
    this.avatarModalOpen = true;
  }

  closeAvatarModal(): void {
    this.stopCamera();
    this.avatarModalOpen = false;
  }

  private toBase64(dataUrl: string): string {
    const comma = dataUrl.indexOf(',');
    return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  }

  async openCamera(): Promise<void> {
    if (this.cameraBusy) {
      return;
    }
    this.cameraBusy = true;
    this.photoTransformStatus = '';
    try {
      this.stopCamera();
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false
      });
      this.cameraOpen = true;
      setTimeout(() => {
        const v = document.getElementById('lpCameraVideo') as HTMLVideoElement | null;
        if (v && this.cameraStream) {
          v.srcObject = this.cameraStream;
          v.play().catch(() => {});
        }
      }, 0);
    } catch {
      this.photoTransformStatus = 'Could not open camera. Check browser permission.';
      this.cameraOpen = false;
    } finally {
      this.cameraBusy = false;
    }
  }

  takePhotoFromCamera(): void {
    const v = document.getElementById('lpCameraVideo') as HTMLVideoElement | null;
    if (!v || !this.cameraOpen) {
      return;
    }
    const w = v.videoWidth || 640;
    const h = v.videoHeight || 640;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    this.photoPreviewUrl = dataUrl;
    this.photoMimeType = 'image/jpeg';
    this.photoBase64 = this.toBase64(dataUrl);
    this.photoTransformStatus = 'Photo captured. Click Transform & Use.';
    this.stopCamera();
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((t) => t.stop());
      this.cameraStream = null;
    }
    this.cameraOpen = false;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.photoTransformStatus = '';
    this.photoBase64 = null;
    this.photoPreviewUrl = null;
    this.photoMimeType = file.type || 'image/png';

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like: data:image/png;base64,AAAA...
      const comma = result.indexOf(',');
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      this.photoBase64 = base64;
      this.photoPreviewUrl = result;
    };
    reader.onerror = () => {
      this.photoTransformStatus = 'Could not read the image file.';
    };
    reader.readAsDataURL(file);
  }

  transformAvatarFromPhoto(): void {
    if (!this.isOwnProfile) {
      return;
    }
    if (!this.photoBase64 || !this.photoMimeType) {
      return;
    }

    this.photoTransforming = true;
    this.photoTransformStatus = 'Generating avatar…';

    this.gamification
      .generateAvatarFromPhoto(
        this.profileUserId,
        this.photoBase64,
        this.photoMimeType,
        this.styleIntensity,
        this.genderPreference
      )
      .subscribe({
      next: (res) => {
        this.photoTransforming = false;
        const parsed = parseAvataaarsUrl(res.avatarUrl);
        this.studioState = mergeAvataaarsState(String(this.profileUserId), parsed);
        this.aiTransformUsed = !!res.aiUsed;
        this.aiTransformEngine = res.engine || '';
        this.photoTransformStatus = res.note || 'Generated. Press Done to save.';
      },
      error: () => {
        this.photoTransforming = false;
        this.photoTransformStatus = 'Avatar generation failed.';
      }
    });
  }

  studioPreviewUrl(): string {
    return buildAvataaarsUrl(this.studioState);
  }

  randomizeStudio(): void {
    this.studioState = {
      ...this.studioState,
      seed: Math.random().toString(36).slice(2, 12)
    };
  }

  setGlassesNone(): void {
    this.studioState = { ...this.studioState, accessoriesProbability: 0 };
  }

  setGlassesOn(): void {
    this.studioState = { ...this.studioState, accessoriesProbability: 100 };
  }

  setBeardNone(): void {
    this.studioState = { ...this.studioState, facialHairProbability: 0 };
  }

  setBeardOn(): void {
    this.studioState = { ...this.studioState, facialHairProbability: 100 };
  }

  saveAvatarFromModal(): void {
    if (!this.isOwnProfile) {
      return;
    }
    const url = buildAvataaarsUrl(this.studioState);
    this.savingProfile = true;
    this.gamification.updatePublicProfile(this.profileUserId, { avatarUrl: url }).subscribe({
      next: () => {
        this.savingProfile = false;
        this.avatarModalOpen = false;
        this.resetAndLoad();
      },
      error: () => {
        this.savingProfile = false;
      }
    });
  }

  avatarDisplayUrl(userId: number, url: string | null | undefined): string {
    if (url && url.trim()) {
      return url.trim();
    }
    return buildAvataaarsUrl(defaultAvataaarsState(String(userId)));
  }

  saveIdentity(): void {
    if (!this.isOwnProfile) {
      return;
    }
    this.savingProfile = true;
    this.gamification
      .updatePublicProfile(this.profileUserId, {
        displayName: this.editDraft.displayName || undefined,
        location: this.editDraft.location || undefined
      })
      .subscribe({
        next: () => {
          this.savingProfile = false;
          this.resetAndLoad();
        },
        error: () => {
          this.savingProfile = false;
        }
      });
  }

  loadFollowing(): void {
    this.followingLoading = true;
    this.gamification.getFollowing(this.profileUserId).subscribe({
      next: (list) => {
        this.following = list;
        this.followingLoading = false;
      },
      error: () => {
        this.followingLoading = false;
      }
    });
  }

  loadFollowers(): void {
    this.followersLoading = true;
    this.gamification.getFollowers(this.profileUserId).subscribe({
      next: (list) => {
        this.followers = list;
        this.followersLoading = false;
      },
      error: () => {
        this.followersLoading = false;
      }
    });
  }

  loadWeeklyXpSeries(): void {
    this.weeklyXpLoading = true;
    this.gamification.getWeeklyXpSeries(this.profileUserId, this.currentUserId).subscribe({
      next: (res) => {
        this.weeklyXp = res;
        this.weeklyXpLoading = false;
      },
      error: () => {
        this.weeklyXpLoading = false;
      }
    });
  }

  chartMaxValue(v?: WeeklyXpSeries | null): number {
    if (!v) return 1;
    const vals = [...(v.profileXpSeries || []), ...(v.comparisonXpSeries || [])];
    const max = Math.max(1, ...vals);
    return Math.ceil(max / 10) * 10;
  }

  seriesTotal(series: number[] | null | undefined): number {
    return (series || []).reduce((a, b) => a + b, 0);
  }

  chartPoints(series: number[], max: number): string {
    if (!series?.length) return '';
    const width = 300;
    const height = 130;
    const step = series.length > 1 ? width / (series.length - 1) : width;
    return series
      .map((v, i) => {
        const x = Math.round(i * step);
        const y = Math.round(height - (Math.max(0, v) / Math.max(1, max)) * height);
        return `${x},${y}`;
      })
      .join(' ');
  }

  chartDotX(index: number, count: number): number {
    if (count <= 1) return 0;
    return Math.round((index * 300) / (count - 1));
  }

  chartDotY(value: number, max: number): number {
    return Math.round(130 - (Math.max(0, value) / Math.max(1, max)) * 130);
  }

  loadCommentsPage(reset: boolean): void {
    if (this.commentsLoading) {
      return;
    }
    if (!reset && !this.commentsHasMore) {
      return;
    }

    if (reset) {
      this.commentsPage = 0;
      this.comments = [];
      this.commentsHasMore = true;
    }

    const pageToLoad = reset ? 0 : this.commentsPage;
    this.commentsLoading = true;

    this.gamification.getEncouragementsPage(this.profileUserId, pageToLoad, 20, this.currentUserId).subscribe({
      next: (res) => {
        const chunk = (res.content || []).map((c) => ({
          ...c,
          reactions: c.reactions || [],
          viewerReaction: c.viewerReaction ?? null
        }));
        if (reset) {
          this.comments = chunk;
        } else {
          this.comments = [...this.comments, ...chunk];
        }
        this.commentsPage = res.page + 1;
        this.commentsTotalPages = res.totalPages;
        this.commentsHasMore = res.page + 1 < res.totalPages;
        this.commentsLoading = false;
      },
      error: () => {
        this.commentsLoading = false;
      }
    });
  }

  onCommentsScroll(el: HTMLElement): void {
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom && this.commentsHasMore && !this.commentsLoading) {
      this.loadCommentsPage(false);
    }
  }

  reactionCount(c: EncouragementView, emoji: string): number {
    return c.reactions?.find((r) => r.emoji === emoji)?.count ?? 0;
  }

  toggleReaction(c: EncouragementView, emoji: string): void {
    if (!this.currentUserId) {
      return;
    }
    this.gamification.postReaction(c.id, this.currentUserId, emoji).subscribe({
      next: () => this.loadCommentsPage(true),
      error: () => {}
    });
  }

  canManageComment(c: EncouragementView): boolean {
    return this.currentUserId !== null && c.fromUserId === this.currentUserId;
  }

  startEditComment(c: EncouragementView): void {
    if (!this.canManageComment(c)) {
      return;
    }
    this.editingEncouragementId = c.id;
    this.editingMessage = c.message;
  }

  cancelEditComment(): void {
    this.editingEncouragementId = null;
    this.editingMessage = '';
  }

  saveEditComment(): void {
    if (!this.currentUserId || this.editingEncouragementId === null) {
      return;
    }
    const msg = this.editingMessage.trim();
    if (!msg) {
      return;
    }
    this.editSaving = true;
    this.gamification
      .editEncouragement(this.editingEncouragementId, this.currentUserId, msg)
      .subscribe({
        next: () => {
          this.editSaving = false;
          this.cancelEditComment();
          this.loadCommentsPage(true);
        },
        error: () => {
          this.editSaving = false;
        }
      });
  }

  deleteComment(enc: EncouragementView): void {
    if (!this.currentUserId) {
      return;
    }
    if (!this.canManageComment(enc)) {
      return;
    }
    // eslint-disable-next-line no-alert
    const ok = confirm('Delete this cheer?');
    if (!ok) {
      return;
    }
    this.deleteLoadingId = enc.id;
    this.gamification.deleteEncouragement(enc.id, this.currentUserId).subscribe({
      next: () => {
        this.deleteLoadingId = null;
        // safest: refresh from the first page
        this.loadCommentsPage(true);
      },
      error: () => {
        this.deleteLoadingId = null;
      }
    });
  }

  isGifMessage(message: string | null | undefined): boolean {
    if (!message) return false;
    const msg = message.trim().toLowerCase();
    return msg.startsWith('http') && (msg.endsWith('.gif') || msg.includes('.gif?') || msg.includes('/giphy.gif'));
  }

  applyGif(url: string): void {
    this.encourageText = url;
    this.showGifPicker = false;
  }

  postEncourage(): void {
    if (!this.currentUserId || this.isOwnProfile || !this.encourageText.trim()) {
      return;
    }
    this.postingEncourage = true;
    this.gamification
      .postEncourage({
        fromUserId: this.currentUserId,
        toUserId: this.profileUserId,
        message: this.encourageText.trim()
      })
      .subscribe({
        next: () => {
          this.encourageText = '';
          this.postingEncourage = false;
          this.loadCommentsPage(true);
          this.gamification.getPublicProfile(this.profileUserId, this.currentUserId).subscribe({
            next: (p) => (this.profile = p)
          });
        },
        error: () => {
          this.postingEncourage = false;
        }
      });
  }

  followToggle(): void {
    if (!this.currentUserId || !this.profile || this.isOwnProfile) {
      return;
    }
    const req = this.profile.viewerIsFollowing
      ? this.gamification.unfollow(this.currentUserId, this.profileUserId)
      : this.gamification.follow(this.currentUserId, this.profileUserId);
    req.subscribe({
      next: () => this.resetAndLoad()
    });
  }

  tierLabel(tier: string): string {
    if (!tier) {
      return '';
    }
    return tier.charAt(0) + tier.slice(1).toLowerCase();
  }

  formatCheerDate(iso: string): string {
    if (!iso) {
      return '';
    }
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  backToLeagues(): void {
    this.router.navigate(['/SkillTests']);
  }
}
