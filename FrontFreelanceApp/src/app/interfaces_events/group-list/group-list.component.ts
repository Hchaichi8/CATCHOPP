import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, NotificationGroup, NotificationItem } from '../notification.service';
import { GroupService } from '../group.service';
import { GroupMemberService } from '../group-member.service';
import { JoinRequestService } from '../join-request.service';
import { EventService } from '../event.service';
import { ClubService } from '../club.service';
import { Club } from '../models';
import { AuthService } from '../../Services/auth.service';

type GroupType = 'Public' | 'Private' | 'Invitation only';

interface GroupDisplay {
  id: number;
  name: string;
  description: string;
  type: GroupType;
  bannerUrl?: string;
  memberCount?: number;
  isJoined?: boolean;
  isJoining?: boolean;
  requestPending?: boolean;
}

const TYPE_TO_DISPLAY: Record<string, GroupType> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  INVITE_ONLY: 'Invitation only'
};

const TYPE_TO_API: Record<GroupType, string> = {
  'Public': 'PUBLIC',
  'Private': 'PRIVATE',
  'Invitation only': 'INVITE_ONLY'
};

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {

  groups: GroupDisplay[] = [];
  loading = false;
  saveError: string | null = null;

  searchTerm = '';
  selectedGroupType = 'all';
  showAllGroups = false;
  currentPage = 1;
  pageSize = 6;

  currentUserId = 0;
  currentUserName = '';
  currentUserRole = '';

  isNotificationsOpen = false;
  upcomingEvents: any[] = [];
  currentMonth = new Date();
  calendarDays: any[] = [];

  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  loadingClubs = false;
  selectedInterest = 'all';
  showAllClubs = false;

  interests = [
    { value: 'all', label: 'All Interests', icon: 'fa-th' },
    { value: 'technology', label: 'Technology', icon: 'fa-laptop-code' },
    { value: 'sports', label: 'Sports', icon: 'fa-futbol' },
    { value: 'arts', label: 'Arts & Culture', icon: 'fa-palette' },
    { value: 'music', label: 'Music', icon: 'fa-music' },
    { value: 'business', label: 'Business', icon: 'fa-briefcase' },
    { value: 'science', label: 'Science', icon: 'fa-flask' },
    { value: 'gaming', label: 'Gaming', icon: 'fa-gamepad' },
    { value: 'photography', label: 'Photography', icon: 'fa-camera' }
  ];

  showModal = false;
  isEditMode = false;
  modalLoading = false;
  modalError: string | null = null;
  editingGroupId: number | null = null;
  groupForm = { name: '', description: '', type: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY', bannerUrl: '' };

  showDeleteConfirm = false;
  deletingGroup: GroupDisplay | null = null;

  constructor(
    private router: Router,
    public notificationService: NotificationService,
    private groupService: GroupService,
    private groupMemberService: GroupMemberService,
    private joinRequestService: JoinRequestService,
    private eventService: EventService,
    private clubService: ClubService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.currentUserName = this.authService.getCurrentUserName();
    this.currentUserRole = this.authService.getCurrentUserRole();
    this.authService.userName$.subscribe(name => { if (name) this.currentUserName = name; });
    this.loadGroups();
    this.loadUpcomingEvents();
    this.loadClubs();
    this.generateCalendar();
  }

  // ── Load Groups — show immediately, load member info in background ─────────
  loadGroups(): void {
    this.loading = true;
    this.saveError = null;

    this.groupService.getGroups().subscribe({
      next: (list) => {
        // Display groups right away — no blocking on member counts
        this.groups = (list || []).map(api => this.apiToDisplay(api));
        this.loading = false;
        this.loadPendingJoinRequests();

        // Load member counts per group independently (non-blocking)
        this.groups.forEach(group => {
          this.groupMemberService.countMembersByGroupId(group.id).subscribe({
            next: (count) => { group.memberCount = count || 0; },
            error: () => { group.memberCount = 0; }
          });
          if (this.currentUserId > 0) {
            this.groupMemberService.getMembersByGroupId(group.id).subscribe({
              next: (members) => {
                group.isJoined = members.some(m => m.userId === this.currentUserId);
              },
              error: () => { group.isJoined = false; }
            });
          }
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('loadGroups error:', err);
        this.saveError = 'Cannot connect to backend. Make sure the API Gateway is running on http://localhost:8085.';
      }
    });
  }

  private apiToDisplay(api: any): GroupDisplay {
    return {
      id: api.id ?? 0,
      name: api.name,
      description: api.description || '',
      type: TYPE_TO_DISPLAY[api.type || ''] ?? 'Public',
      bannerUrl: api.bannerUrl || '',
      memberCount: 0,
      isJoined: false
    };
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  get filteredGroups(): GroupDisplay[] {
    let result = this.groups;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(term) || g.description.toLowerCase().includes(term)
      );
    }
    if (this.selectedGroupType && this.selectedGroupType !== 'all') {
      const map: Record<string, GroupType> = { PUBLIC: 'Public', PRIVATE: 'Private', INVITE_ONLY: 'Invitation only' };
      const display = map[this.selectedGroupType];
      if (display) result = result.filter(g => g.type === display);
    }
    return result;
  }

  get paginatedGroups(): GroupDisplay[] {
    const all = this.filteredGroups;
    if (!this.showAllGroups) return all.slice(0, 4);
    const start = (this.currentPage - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.ceil(this.filteredGroups.length / this.pageSize); }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.currentPage = p; window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  onGroupTypeChange(e: any): void { this.selectedGroupType = e.target.value; this.currentPage = 1; }
  onSearch(): void { this.currentPage = 1; }
  toggleShowAllGroups(): void { this.showAllGroups = !this.showAllGroups; this.currentPage = 1; }
  filterGroups(): void { this.currentPage = 1; }

  // ── CRUD Create ───────────────────────────────────────────────────────────
  openCreateModal(): void {
    this.isEditMode = false;
    this.editingGroupId = null;
    this.groupForm = { name: '', description: '', type: 'PUBLIC', bannerUrl: '' };
    this.modalError = null;
    this.showModal = true;
  }

  // ── CRUD Edit ─────────────────────────────────────────────────────────────
  openEditModal(group: GroupDisplay, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.isEditMode = true;
    this.editingGroupId = group.id;
    this.groupForm = {
      name: group.name,
      description: group.description,
      type: (TYPE_TO_API[group.type] || 'PUBLIC') as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY',
      bannerUrl: group.bannerUrl || ''
    };
    this.modalError = null;
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.modalError = null; }

  submitGroupForm(): void {
    if (!this.groupForm.name.trim() || !this.groupForm.description.trim()) {
      this.modalError = 'Name and description are required.';
      return;
    }
    this.modalLoading = true;
    this.modalError = null;
    const payload = {
      name: this.groupForm.name.trim(),
      description: this.groupForm.description.trim(),
      type: this.groupForm.type as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY',
      bannerUrl: this.groupForm.bannerUrl.trim() || undefined
    };

    if (this.isEditMode && this.editingGroupId !== null) {
      this.groupService.updateGroup(this.editingGroupId, payload).subscribe({
        next: () => { this.modalLoading = false; this.showModal = false; this.loadGroups(); },
        error: (err) => { this.modalLoading = false; this.modalError = 'Failed to update group.'; console.error(err); }
      });
    } else {
      this.groupService.createGroup(payload).subscribe({
        next: (created) => {
          this.modalLoading = false; this.showModal = false; this.loadGroups(); this.launchConfetti();
          this.notificationService.addNotification({ type: 'group', title: `Group "${created.name}" created!`, message: 'Your group has been created.', importance: 'normal', relatedRoute: `/GroupPage/${created.id}` });
        },
        error: (err) => { this.modalLoading = false; this.modalError = 'Failed to create group.'; console.error(err); }
      });
    }
  }

  // ── CRUD Delete ───────────────────────────────────────────────────────────
  confirmDelete(group: GroupDisplay, event?: MouseEvent): void { if (event) event.stopPropagation(); this.deletingGroup = group; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.deletingGroup = null; }

  executeDelete(): void {
    if (!this.deletingGroup) return;
    const id = this.deletingGroup.id;
    const name = this.deletingGroup.name;
    this.showDeleteConfirm = false;
    this.deletingGroup = null;
    this.groupService.deleteGroup(id).subscribe({
      next: () => {
        this.groups = this.groups.filter(g => g.id !== id);
        this.notificationService.addNotification({ type: 'group', title: `Group "${name}" deleted`, message: 'The group has been permanently deleted.', importance: 'normal' });
      },
      error: (err) => { console.error('Delete failed:', err); alert('Failed to delete group.'); }
    });
  }

  // ── Join ──────────────────────────────────────────────────────────────────
  joinGroup(group: GroupDisplay, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (group.isJoined || group.isJoining) return;
    if (group.type === 'Invitation only') { this.requestInvite(group, event); return; }
    group.isJoining = true;
    this.groupMemberService.addMember({ group: { id: group.id }, userId: this.currentUserId, role: 'MEMBER' }).subscribe({
      next: () => {
        group.memberCount = (group.memberCount || 0) + 1;
        group.isJoined = true; group.isJoining = false; this.launchConfetti();
        this.notificationService.addNotification({ type: 'group', title: `Joined ${group.name}`, message: `You are now a member of "${group.name}".`, importance: 'normal', relatedRoute: `/GroupPage/${group.id}` });
      },
      error: (err) => { group.isJoining = false; if (err.status === 409 || err.status === 400) { group.isJoined = true; } else { alert('Error joining group.'); } }
    });
  }

  requestInvite(group: GroupDisplay, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (group.isJoining) return;
    group.isJoining = true;
    this.joinRequestService.requestJoin(group.id, this.currentUserId).subscribe({
      next: () => { group.isJoining = false; group.requestPending = true; this.notificationService.addNotification({ type: 'group', title: '✉️ Request Sent', message: `Your request to join "${group.name}" has been sent.`, importance: 'normal', relatedRoute: `/GroupPage/${group.id}` }); },
      error: () => { group.isJoining = false; group.requestPending = true; }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  viewGroup(id: number): void { this.router.navigate(['/GroupPage', id]); }
  navigateToEvents(): void { this.router.navigate(['/EventsList']); }
  goBack(): void {
    if (this.currentUserRole === 'FREELANCER') this.router.navigate(['/FreelancerFeed']);
    else if (this.currentUserRole === 'CLIENT') this.router.navigate(['/ClientFeed']);
    else this.router.navigate(['/']);
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  get unreadNotificationsCount(): number { return this.notificationService.unreadCount; }
  get notificationGroups(): NotificationGroup[] { return this.notificationService.getGroups(); }
  toggleNotifications(): void { this.isNotificationsOpen = !this.isNotificationsOpen; }
  openFromNotification(n: NotificationItem, event?: MouseEvent): void {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    this.notificationService.markAsRead(n.id);
    if (n.relatedRoute) this.router.navigateByUrl(n.relatedRoute);
  }
  handleNotificationClick(n: any): void { this.openFromNotification(n); }

  // ── Calendar ──────────────────────────────────────────────────────────────
  previousMonth(): void { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1); this.generateCalendar(); }
  nextMonth(): void { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1); this.generateCalendar(); }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear(), month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    this.calendarDays = [];
    const prev = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) this.calendarDays.push({ date: prev - i, isOtherMonth: true, isToday: false, hasEvent: false });
    for (let i = 1; i <= daysInMonth; i++) this.calendarDays.push({ date: i, isOtherMonth: false, isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year, hasEvent: false });
    for (let i = 1; i <= 42 - this.calendarDays.length; i++) this.calendarDays.push({ date: i, isOtherMonth: true, isToday: false, hasEvent: false });
  }

  // ── Events ────────────────────────────────────────────────────────────────
  loadUpcomingEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        const now = new Date();
        this.upcomingEvents = events.filter(e => e.status === 'APPROVED' || !e.status).filter(e => new Date(e.startDate) >= now).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 2);
      },
      error: () => {}
    });
  }

  // ── Clubs ─────────────────────────────────────────────────────────────────
  loadClubs(): void {
    this.loadingClubs = true;
    this.clubService.getAllClubs().subscribe({
      next: (data) => { this.clubs = data; this.filterClubs(); this.loadingClubs = false; },
      error: () => { this.loadingClubs = false; }
    });
  }

  filterClubs(): void {
    let f = this.clubs;
    if (this.selectedInterest !== 'all') f = f.filter(c => c.interests?.toLowerCase().includes(this.selectedInterest));
    if (this.searchTerm.trim()) { const t = this.searchTerm.toLowerCase(); f = f.filter(c => c.name.toLowerCase().includes(t) || c.description.toLowerCase().includes(t) || c.interests?.toLowerCase().includes(t)); }
    this.filteredClubs = this.showAllClubs ? f : f.slice(0, 4);
  }

  onInterestChange(i: string): void { this.selectedInterest = i; this.filterClubs(); }
  toggleShowAllClubs(): void { this.showAllClubs = !this.showAllClubs; this.filterClubs(); }
  viewClubDetails(id: number, e?: MouseEvent): void { if (e) e.stopPropagation(); this.router.navigate(['/Club', id]); }
  joinClub(club: Club, e?: MouseEvent): void { if (e) e.stopPropagation(); if (confirm(`Join "${club.name}"?`)) this.router.navigate(['/Club', club.id]); }

  getClubIcon(interests: string | undefined): string {
    if (!interests) return 'fa-users';
    const i = interests.toLowerCase();
    if (i.includes('tech')) return 'fa-laptop-code';
    if (i.includes('sport')) return 'fa-futbol';
    if (i.includes('art') || i.includes('culture')) return 'fa-palette';
    if (i.includes('music')) return 'fa-music';
    if (i.includes('business')) return 'fa-briefcase';
    if (i.includes('science')) return 'fa-flask';
    if (i.includes('gaming') || i.includes('game')) return 'fa-gamepad';
    if (i.includes('photo')) return 'fa-camera';
    return 'fa-users';
  }

  getInterestBadges(interests: string | undefined): string[] {
    if (!interests) return [];
    return interests.split(',').map(i => i.trim()).filter(i => i.length > 0);
  }

  // ── Join Requests (admin panel) ───────────────────────────────────────────
  pendingJoinRequests: any[] = [];

  loadPendingJoinRequests(): void {
    // Load pending requests for all INVITE_ONLY groups
    const inviteGroups = this.groups.filter(g => g.type === 'Invitation only');
    this.pendingJoinRequests = [];
    inviteGroups.forEach(group => {
      this.joinRequestService.getPendingRequests(group.id).subscribe({
        next: (reqs) => {
          this.pendingJoinRequests = [
            ...this.pendingJoinRequests,
            ...reqs.map(r => ({ ...r, group: { id: group.id, name: group.name } }))
          ];
        },
        error: () => {}
      });
    });
  }

  acceptJoinRequest(requestId: number): void {
    this.joinRequestService.acceptRequest(requestId).subscribe({
      next: () => {
        this.pendingJoinRequests = this.pendingJoinRequests.filter(r => r.id !== requestId);
        this.loadGroups(); // Refresh member counts
        this.notificationService.addNotification({
          type: 'group', title: '✅ Request Accepted',
          message: 'The join request has been accepted.', importance: 'normal'
        });
      },
      error: () => alert('Failed to accept request.')
    });
  }

  rejectJoinRequest(requestId: number): void {
    this.joinRequestService.rejectRequest(requestId).subscribe({
      next: () => {
        this.pendingJoinRequests = this.pendingJoinRequests.filter(r => r.id !== requestId);
        this.notificationService.addNotification({
          type: 'group', title: '❌ Request Rejected',
          message: 'The join request has been rejected.', importance: 'normal'
        });
      },
      error: () => alert('Failed to reject request.')
    });
  }

  // ── Confetti ──────────────────────────────────────────────────────────────
  launchConfetti(): void {
    const colors = ['#198754', '#20c997', '#0d6efd', '#f59e0b', '#ef4444', '#8b5cf6'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;width:8px;height:8px;border-radius:${Math.random() > .5 ? '50%' : '2px'};background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}vw;top:-10px;animation:confettiFall ${1 + Math.random() * 2}s ease-in forwards;z-index:9999;pointer-events:none;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}`;
      document.head.appendChild(style);
    }
  }
}
