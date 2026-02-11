import { Component } from '@angular/core';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.css'
})
export class ClientProfileComponent {


  currentTab: string = 'about'; 

  // Function to switch tabs
  setTab(tabName: string) {
    this.currentTab = tabName;
  }

}
