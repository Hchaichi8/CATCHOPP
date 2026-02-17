import { Component } from '@angular/core';

@Component({
  selector: 'app-freelancer-profil',
  templateUrl: './freelancer-profil.component.html',
  styleUrl: './freelancer-profil.component.css'
})
export class FreelancerProfilComponent {
  // Default tab
  currentTab: string = 'overview'; 

  setTab(tabName: string) {
    this.currentTab = tabName;
  }

}
