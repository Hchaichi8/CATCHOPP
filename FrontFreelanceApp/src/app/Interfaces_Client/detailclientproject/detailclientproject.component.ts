import { Component } from '@angular/core';

@Component({
  selector: 'app-detailclientproject',
  templateUrl: './detailclientproject.component.html',
  styleUrl: './detailclientproject.component.css'
})
export class DetailclientprojectComponent {
  currentTab: string = 'details';

  setTab(tab: string) {
    this.currentTab = tab;
  }

}
