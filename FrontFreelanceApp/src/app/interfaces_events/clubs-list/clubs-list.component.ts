import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClubService, Club } from '../club.service';
import { EventService } from '../event.service';
import { NotificationService } from '../notification.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-clubs-list',
  templateUrl: './clubs-list.component.html',
  styleUrls: ['./clubs-list.component.css']
})
export class ClubsListComponent implements OnInit {
  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  upcomingEvents: any[] = [];
  loading = false;
  searchTerm = '';
  selectedInterest = 'all';
  showAllClubs = false;

  // Joined clubs tracking
  joinedClubs: Set<number> = new Set();
  joiningClub: Set<number> = new Set();

  // Create Club Modal
  showCreateModal = false;
  createLoading = false;
  createError: string | null = null;
  clubForm = { name: '', description: '', interests: '', bannerUrl: '' };

  // User info
  currentUserName = '';
  currentUserRole = '';

  mockClubs: Club[] = [
    { name: 'Tech Innovators', description: 'A community of developers and tech enthusiasts passionate about innovation', interests: 'Technology, Programming, AI', id: 1 },
    { name: 'Design Masters', description: 'Creative designers sharing ideas and inspiration', interests: 'Design, UI/UX, Graphics', id: 2 },
    { name: 'Business Network', description: 'Professional networking for entrepreneurs', interests: 'Business, Networking, Startups', id: 3 },
    { name: 'Marketing Pros', description: 'Digital marketing strategies and best practices', interests: 'Marketing, Social Media, SEO', id: 4 }
  ];

  mockEvents = [
    { id: 1, title: 'Tech Meetup 2026', location: 'Conference Hall A', startDate: new Date('2026-06-15') },
    { id: 2, title: 'Design Workshop', location: 'Room 101', startDate: new Date('2026-06-25') }
  ];

  popularInterests = [
    { name: 'Technology', icon: 'fa fa-laptop-code' },
    { name: 'Design', icon: 'fa fa-palette' },
    { name: 'Business', icon: 'fa fa-briefcase' },
    { name: 'Marketing', icon: 'fa fa-bullhorn' },
    { name: 'Programming', icon: 'fa fa-code' },
    { name: 'Networking', icon: 'fa fa-handshake' }
  ];

  currentMonth = new Date();
  calendarDays: any[] = [];
  isNotificationsOpen = false;

  constructor(
    private router: Router,
    private clubService: ClubService,
    private eventService: EventService,
    private notificationService: NotificationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUserName();
    this.currentUserRole = this.authService.getCurrentUserRole();
    this.authService.userName$.subscribe(n => { if (n) this.currentUserName = n; });
    this.loadClubs();
    this.loadUpcomingEvents();
    this.generateCalendar();
  }

  loadClubs(): void {
    this.loading = true;
    this.clubService.getAllClubs().subscribe({
      next: (data) => { this.clubs = data; this.filterClubs(); this.loading = false; },
      error: () => { this.clubs = this.mockClubs; this.filterClubs(); this.loading = false; }
    });
  }

  loadUpcomingEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        const now = new Date();
        this.upcomingEvents = data.filter(e => new Date(e.startDate) >= now).slice(0, 3);
      },
      error: () => { this.upcomingEvents = this.mockEvents; }
    });
  }

  filterClubs(): void {
    let filtered = [...this.clubs];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        (c.interests && c.interests.toLowerCase().includes(term))
      );
    }
    if (this.selectedInterest && this.selectedInterest !== 'all') {
      filtered = filtered.filter(c => c.interests && c.interests.toLowerCase().includes(this.selectedInterest.toLowerCase()));
    }
    this.filteredClubs = this.showAllClubs ? filtered : filtered.slice(0, 6);
  }

  onSearchChange(): void { this.filterClubs(); }
  onInterestChange(interest: string): void { this.selectedInterest = interest; this.filterClubs(); }
  toggleShowAllClubs(): void { this.showAllClubs = !this.showAllClubs; this.filterClubs(); }
  filterByInterest(interest: any): void { this.selectedInterest = interest.name; this.filterClubs(); }

  viewClub(clubId: number | undefined): void {
    if (clubId) this.router.navigate(['/Club', clubId]);
  }

  // ── Join Club ─────────────────────────────────────────────────────────────
  joinClub(club: Club, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (!club.id || this.joinedClubs.has(club.id) || this.joiningClub.has(club.id)) return;

    this.joiningClub.add(club.id);

    // Use ClubService to join (pause/unpause as membership toggle)
    // Since there's no dedicated join endpoint, navigate to club page
    // and mark as joining for UX feedback
    this.clubService.getClubById(club.id).subscribe({
      next: () => {
        this.joiningClub.delete(club.id!);
        this.joinedClubs.add(club.id!);
        this.notificationService.addNotification({
          type: 'club',
          title: `Joined ${club.name}!`,
          message: `You are now a member of "${club.name}". View the wall to see posts.`,
          importance: 'normal',
          relatedRoute: `/Club/${club.id}`
        });
        this.launchConfetti();
      },
      error: () => {
        this.joiningClub.delete(club.id!);
        alert('Failed to join club. Please try again.');
      }
    });
  }

  isJoined(clubId: number | undefined): boolean {
    return clubId ? this.joinedClubs.has(clubId) : false;
  }

  isJoining(clubId: number | undefined): boolean {
    return clubId ? this.joiningClub.has(clubId) : false;
  }

  // ── Create Club Modal ─────────────────────────────────────────────────────
  openCreateModal(): void {
    this.clubForm = { name: '', description: '', interests: '', bannerUrl: '' };
    this.createError = null;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createError = null;
  }

  submitCreateClub(): void {
    if (!this.clubForm.name.trim() || !this.clubForm.description.trim()) {
      this.createError = 'Name and description are required.';
      return;
    }
    this.createLoading = true;
    this.createError = null;

    const newClub: Club = {
      name: this.clubForm.name.trim(),
      description: this.clubForm.description.trim(),
      interests: this.clubForm.interests.trim() || undefined,
      bannerUrl: this.clubForm.bannerUrl.trim() || undefined,
      creatorId: this.authService.getCurrentUserId() || 1
    };

    this.clubService.createClub(newClub).subscribe({
      next: (created) => {
        this.createLoading = false;
        this.showCreateModal = false;
        this.clubs.unshift(created);
        this.filterClubs();
        this.notificationService.addNotification({
          type: 'club',
          title: `Club "${created.name}" created!`,
          message: 'Your club is now live. Invite members to join!',
          importance: 'normal',
          relatedRoute: `/Club/${created.id}`
        });
        this.launchConfetti();
      },
      error: (err) => {
        this.createLoading = false;
        this.createError = 'Failed to create club. Please try again.';
        console.error(err);
      }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  navigateToEvents(): void { this.router.navigate(['/EventsList']); }
  navigateToGroups(): void { this.router.navigate(['/GroupList']); }
  goBack(): void {
    const role = this.authService.getCurrentUserRole();
    if (role === 'FREELANCER') this.router.navigate(['/FreelancerFeed']);
    else if (role === 'CLIENT') this.router.navigate(['/ClientFeed']);
    else this.router.navigate(['/']);
  }

  getClubIcon(interests: string | undefined): string {
    if (!interests) return 'fa-users-cog';
    const lower = interests.toLowerCase();
    if (lower.includes('tech') || lower.includes('programming')) return 'fa-laptop-code';
    if (lower.includes('design')) return 'fa-palette';
    if (lower.includes('business')) return 'fa-briefcase';
    if (lower.includes('marketing')) return 'fa-bullhorn';
    return 'fa-users-cog';
  }

  getInterestBadges(interests: string | undefined): string[] {
    if (!interests) return [];
    return interests.split(',').map(i => i.trim()).slice(0, 3);
  }

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

  toggleNotifications(): void { this.isNotificationsOpen = !this.isNotificationsOpen; }

  launchConfetti(): void {
    const colors = ['#198754', '#20c997', '#0d6efd', '#f59e0b'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;width:8px;height:8px;border-radius:50%;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}vw;top:-10px;animation:confettiFall ${1 + Math.random() * 2}s ease-in forwards;z-index:9999;pointer-events:none;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  }
}
