import { Component } from '@angular/core';

@Component({
  selector: 'app-client-feed',
  templateUrl: './client-feed.component.html',
  styleUrl: './client-feed.component.css'
})
export class ClientFeedComponent {
isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto'; // Unlock background scroll
  }

}
