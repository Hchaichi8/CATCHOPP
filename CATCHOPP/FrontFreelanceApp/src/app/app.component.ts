import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'FrontFreelanceApp';

  constructor(
    private theme: ThemeService,
    _notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.theme.init();
  }
}
