import { Component , ElementRef,HostListener} from '@angular/core';

@Component({
  selector: 'app-client-feed',
  templateUrl: './client-feed.component.html',
  styleUrl: './client-feed.component.css'
})
export class ClientFeedComponent {
// State for Create Project Modal
  isProjectModalOpen: boolean = false;

  // State for Messages Dropdown
  isMessagesOpen: boolean = false;

  constructor(private eRef: ElementRef) {}

  // --- Project Modal Logic ---
  openProjectModal() {
    this.isProjectModalOpen = true;
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  closeProjectModal() {
    this.isProjectModalOpen = false;
    document.body.style.overflow = 'auto'; // Unlock background scroll
  }

  // --- Messages Dropdown Logic ---
  toggleMessages() {
    this.isMessagesOpen = !this.isMessagesOpen;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isMessagesOpen = false;
    }
  }

}
