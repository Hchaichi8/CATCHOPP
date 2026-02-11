import { Component } from '@angular/core';

@Component({
  selector: 'app-technical-support',
  templateUrl: './technical-support.component.html',
  styleUrl: './technical-support.component.css'
})
export class TechnicalSupportComponent {
  isSupportOpen: boolean = false;

  toggleSupport() {
    this.isSupportOpen = !this.isSupportOpen;
  }

}
