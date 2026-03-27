import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'FrontFreelanceApp';

  constructor(private theme: ThemeService) {}

  ngOnInit(): void {
    this.theme.init();
  }
}
