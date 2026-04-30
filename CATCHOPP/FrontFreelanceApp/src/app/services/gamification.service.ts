import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8079/SkillTests/gamification';
const SOCIAL = `${API}/social`;

export interface DailyChallengeView {
  id: number;
  code: string;
  title: string;
  targetCount: number;
  currentCount: number;
  pointsReward: number;
  completed: boolean;
}

export interface LeagueBoardRow {
  userId: number;
  weeklyLeagueXp: number;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
  streakDays: number;
  followersCount: number;
  isFollowing: boolean;
}

export interface LeaguePrizeInfo {
  place: number;
  title: string;
  bonusPoints: number;
  badgeDescription: string;
}

export interface LeagueRules {
  summary: string;
  promoteTopCount: number;
  demoteBottomCount: number;
  mustHavePositiveWeeklyXpToPromote: boolean;
  resetScheduleHuman: string;
  howPromotionWorks: string;
  howDemotionWorks: string;
  weeklyTopPrizes: LeaguePrizeInfo[];
}

export interface TierLeaderRow {
  userId: number;
  weeklyLeagueXp: number;
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
  streakDays: number;
  leagueTier: string;
  followersCount: number;
  isFollowing: boolean;
  encouragementCountLast7Days: number;
  promotionsTotal: number;
  demotionsTotal: number;
}

export interface LeaguePublicProfile {
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
  streakDays: number;
  leagueTier: string;
  weeklyLeagueXp: number;
  totalPoints: number;
  followersCount: number;
  followingCount: number;
  promotionsTotal: number;
  demotionsTotal: number;
  recentEncouragements: EncouragementView[];
  viewerIsFollowing: boolean;
}

export interface FollowingUser {
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  leagueTier: string;
  weeklyLeagueXp: number;
  streakDays: number;
  totalPoints: number;
}

export interface EncouragementPage {
  content: EncouragementView[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ReactionCount {
  emoji: string;
  count: number;
}

export interface EncouragementView {
  id: number;
  fromUserId: number;
  fromDisplayName: string;
  message: string;
  createdAt: string;
  reactions: ReactionCount[];
  viewerReaction: string | null;
}

export interface AvatarFromPhotoGenerateResponse {
  avatarUrl: string;
  aiUsed: boolean;
  engine: string;
  note: string;
}

export interface WeeklyXpSeries {
  profileUserId: number;
  profileDisplayName: string;
  labels: string[];
  profileXpSeries: number[];
  comparisonUserId: number | null;
  comparisonDisplayName: string | null;
  comparisonXpSeries: number[];
}

export interface TierSnapshot {
  tier: string;
  displayName: string;
  memberCount: number;
  topPlayers: TierLeaderRow[];
}

export interface LeaguesOverview {
  rules: LeagueRules;
  tiers: TierSnapshot[];
}

export interface GamificationDashboard {
  userId: number;
  totalPoints: number;
  leagueTier: string;
  weeklyLeagueXp: number;
  leagueWeekStartMonday: string;
  activeSubscriber: boolean;
  badges: string[];
  dailyChallenges: DailyChallengeView[];
  nextLeagueReset: string;
  rankInTier: number;
  playersInTier: number;
  leagueTopPlayers: LeagueBoardRow[];
}

@Injectable({ providedIn: 'root' })
export class GamificationService {
  constructor(private http: HttpClient) {}

  getDashboard(userId: number): Observable<GamificationDashboard> {
    return this.http.get<GamificationDashboard>(`${API}/dashboard/${userId}`);
  }

  getLeaguesOverview(viewerUserId?: number | null): Observable<LeaguesOverview> {
    let params = new HttpParams();
    if (viewerUserId != null) {
      params = params.set('viewerUserId', String(viewerUserId));
    }
    return this.http.get<LeaguesOverview>(`${API}/leagues/overview`, { params });
  }

  updatePublicProfile(
    userId: number,
    body: { displayName?: string; avatarUrl?: string; location?: string }
  ): Observable<void> {
    return this.http.put<void>(`${SOCIAL}/profile/${userId}`, body);
  }

  getPublicProfile(userId: number, viewerUserId?: number | null): Observable<LeaguePublicProfile> {
    let params = new HttpParams();
    if (viewerUserId != null) {
      params = params.set('viewerUserId', String(viewerUserId));
    }
    return this.http.get<LeaguePublicProfile>(`${SOCIAL}/profile/${userId}`, { params });
  }

  getFollowing(userId: number): Observable<FollowingUser[]> {
    return this.http.get<FollowingUser[]>(`${SOCIAL}/following/${userId}`);
  }

  getFollowers(userId: number): Observable<FollowingUser[]> {
    return this.http.get<FollowingUser[]>(`${SOCIAL}/followers/${userId}`);
  }

  getEncouragementsPage(
    targetUserId: number,
    page: number,
    size: number,
    viewerUserId?: number | null
  ): Observable<EncouragementPage> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (viewerUserId != null) {
      params = params.set('viewerUserId', String(viewerUserId));
    }
    return this.http.get<EncouragementPage>(`${SOCIAL}/encouragements/${targetUserId}`, { params });
  }

  /** Toggle or switch emoji on a cheer (same emoji again removes). Pass null to clear. */
  postReaction(encouragementId: number, userId: number, emoji: string | null): Observable<void> {
    let params = new HttpParams().set('userId', String(userId));
    if (emoji != null && emoji !== '') {
      params = params.set('emoji', emoji);
    }
    return this.http.post<void>(`${SOCIAL}/encouragements/${encouragementId}/react`, null, { params });
  }

  editEncouragement(encouragementId: number, userId: number, message: string): Observable<void> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.put<void>(`${SOCIAL}/encouragements/${encouragementId}`, { message }, { params });
  }

  deleteEncouragement(encouragementId: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.delete<void>(`${SOCIAL}/encouragements/${encouragementId}`, { params });
  }

  generateAvatarFromPhoto(
    userId: number,
    imageBase64: string,
    mimeType: string,
    styleIntensity: number = 70,
    genderPreference: 'auto' | 'male' | 'female' | 'neutral' = 'auto'
  ): Observable<AvatarFromPhotoGenerateResponse> {
    const body = { imageBase64, mimeType, styleIntensity, genderPreference };
    return this.http.post<AvatarFromPhotoGenerateResponse>(
      `${SOCIAL}/avatar/from-photo/${userId}`,
      body
    );
  }

  getWeeklyXpSeries(userId: number, viewerUserId?: number | null): Observable<WeeklyXpSeries> {
    let params = new HttpParams();
    if (viewerUserId != null) {
      params = params.set('viewerUserId', String(viewerUserId));
    }
    return this.http.get<WeeklyXpSeries>(`${SOCIAL}/xp-weekly/${userId}`, { params });
  }

  follow(followerId: number, targetUserId: number): Observable<void> {
    const params = new HttpParams()
      .set('followerId', String(followerId))
      .set('targetUserId', String(targetUserId));
    return this.http.post<void>(`${SOCIAL}/follow`, null, { params });
  }

  unfollow(followerId: number, targetUserId: number): Observable<void> {
    const params = new HttpParams()
      .set('followerId', String(followerId))
      .set('targetUserId', String(targetUserId));
    return this.http.delete<void>(`${SOCIAL}/follow`, { params });
  }

  postEncourage(body: { fromUserId: number; toUserId: number; message: string }): Observable<void> {
    return this.http.post<void>(`${SOCIAL}/encourage`, body);
  }

  recordApply(userId: number): Observable<void> {
    return this.http.post<void>(`${API}/event/apply/${userId}`, {});
  }

  markProfileComplete(userId: number): Observable<void> {
    return this.http.post<void>(`${API}/event/profile-complete/${userId}`, {});
  }

  syncSubscriber(userId: number, active: boolean): Observable<void> {
    return this.http.post<void>(`${API}/subscriber/${userId}?active=${active}`, {});
  }
}
