import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../event.service';
import { GroupService } from '../group.service';
import { NotificationService } from '../notification.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {

  events: any[] = [];
  filteredEvents: any[] = [];
  featuredEvents: any[] = [];
  availableGroups: any[] = [];
  loading = false;
  searchTerm = '';
  selectedFilter: 'all' | 'upcoming' | 'past' = 'all';
  statusFilter: 'all' | 'upcoming' | 'past' = 'all';
  typeFilter: 'all' | 'online' | 'in-person' = 'all';
  isCreateModalOpen = false;

  // Stats
  upcomingEventsCount = 0;
  totalAttendeesCount = 0;
  uniqueLocationsCount = 0;

  // Attended events tracking
  attendedEvents: Set<number> = new Set<number>();

  // User info
  currentUserName = '';
  currentUserRole = '';

  popularCategories = [
    { name: 'Technology', icon: 'fa fa-laptop-code' },
    { name: 'Business', icon: 'fa fa-briefcase' },
    { name: 'Design', icon: 'fa fa-palette' },
    { name: 'Networking', icon: 'fa fa-handshake' }
  ];

  newEventForm = {
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    groupId: 0,
    status: 'PENDING'
  };

  constructor(
    private router: Router,
    private eventService: EventService,
    private groupService: GroupService,
    private notificationService: NotificationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserName = this.authService.getCurrentUserName();
    this.currentUserRole = this.authService.getCurrentUserRole();
    this.authService.userName$.subscribe(n => { if (n) this.currentUserName = n; });
    this.loadEvents();
    this.loadGroups();
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.featuredEvents = events.filter(e => e.status === 'APPROVED' || !e.status).slice(0, 1);
        this.updateStats();
        this.filterEvents();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadGroups(): void {
    this.groupService.getAllGroups().subscribe({
      next: (groups) => { this.availableGroups = groups; },
      error: () => {}
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  updateStats(): void {
    this.upcomingEventsCount = this.events.filter(e => this.isUpcoming(e)).length;
    this.totalAttendeesCount = this.events.reduce((s, e) => s + (e.attendeesCount || 0), 0);
    this.uniqueLocationsCount = new Set(this.events.map(e => e.location)).size;
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  filterEvents(): void {
    const now = new Date();
    let filtered = [...this.events];

    if (this.statusFilter === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.startDate) >= now);
    } else if (this.statusFilter === 'past') {
      filtered = filtered.filter(e => new Date(e.endDate || e.startDate) < now);
    }

    if (this.typeFilter === 'online') {
      filtered = filtered.filter(e => e.location && e.location.toLowerCase().includes('online'));
    } else if (this.typeFilter === 'in-person') {
      filtered = filtered.filter(e => !e.location || !e.location.toLowerCase().includes('online'));
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        (e.description && e.description.toLowerCase().includes(term)) ||
        (e.location && e.location.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    this.filteredEvents = filtered;
  }

  onSearchChange(): void { this.filterEvents(); }

  onFilterChange(filter: 'all' | 'upcoming' | 'past'): void {
    this.selectedFilter = filter;
    this.statusFilter = filter;
    this.filterEvents();
  }

  onStatusFilterChange(status: 'all' | 'upcoming' | 'past'): void {
    this.statusFilter = status;
    this.selectedFilter = status;
    this.filterEvents();
  }

  onTypeFilterChange(type: 'all' | 'online' | 'in-person'): void {
    this.typeFilter = type;
    this.filterEvents();
  }

  filterByCategory(category: any): void {
    this.searchTerm = category.name;
    this.filterEvents();
  }

  // ── Attend ────────────────────────────────────────────────────────────────
  attendEvent(eventId: number): void {
    if (this.attendedEvents.has(eventId)) return;
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      this.attendedEvents.add(eventId);
      this.totalAttendeesCount++;
      this.notificationService.addNotification({
        type: 'event',
        title: '✅ Joined Event!',
        message: `You have joined "${event.title}"`,
        importance: 'normal'
      });
    }
  }

  isAttending(eventId: number): boolean {
    return this.attendedEvents.has(eventId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isUpcoming(event: any): boolean {
    return new Date(event.startDate) >= new Date();
  }

  getUpcomingCount(): number {
    return this.events.filter(e => this.isUpcoming(e)).length;
  }

  getPastCount(): number {
    return this.events.filter(e => !this.isUpcoming(e)).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getMonthDay(dateString: string): { day: string; month: string } {
    const date = new Date(dateString);
    return { day: date.getDate().toString(), month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  navigateToGroups(): void { this.router.navigate(['/GroupList']); }
  navigateToClubDashboard(): void { this.router.navigate(['/ClubDashboard']); }
  viewEventDetails(eventId: number): void { this.router.navigate(['/EventDetails', eventId]); }

  // ── Create Event Modal ────────────────────────────────────────────────────
  openCreateEventModal(): void {
    this.newEventForm = {
      title: '', description: '', location: '', startDate: '', endDate: '',
      groupId: this.availableGroups.length > 0 ? this.availableGroups[0].id : 0,
      status: 'PENDING'
    };
    this.isCreateModalOpen = true;
  }

  closeCreateEventModal(): void {
    this.isCreateModalOpen = false;
  }

  createEvent(): void {
    this.submitEvent();
  }

  submitEvent(): void {
    if (!this.newEventForm.title || !this.newEventForm.description ||
        !this.newEventForm.location || !this.newEventForm.startDate ||
        !this.newEventForm.endDate || !this.newEventForm.groupId) {
      alert('Please fill in all required fields');
      return;
    }

    const eventData = {
      title: this.newEventForm.title.trim(),
      description: this.newEventForm.description.trim(),
      location: this.newEventForm.location.trim(),
      startDate: this.newEventForm.startDate,
      endDate: this.newEventForm.endDate,
      group: { id: this.newEventForm.groupId },
      status: 'PENDING'
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (created) => {
        this.notificationService.addNotification({
          type: 'event',
          title: 'Event Submitted',
          message: `"${created.title}" has been submitted and is pending approval`,
          importance: 'normal'
        });
        this.closeCreateEventModal();
      },
      error: (err) => {
        console.error('Error creating event:', err);
        alert('Error submitting event. Please try again.');
      }
    });
  }
}
