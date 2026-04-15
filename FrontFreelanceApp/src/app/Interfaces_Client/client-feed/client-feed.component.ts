import { Component } from '@angular/core';
import { ProjectScopeAnalysis, ProjectScopeService } from '../../services/project-scope.service';

@Component({
  selector: 'app-client-feed',
  templateUrl: './client-feed.component.html',
  styleUrl: './client-feed.component.css'
})
export class ClientFeedComponent {
  isModalOpen = false;

  projectTitle = '';
  projectDescription = '';

  scopeLoading = false;
  scopeError = '';
  scopeResult: ProjectScopeAnalysis | null = null;

  constructor(private projectScope: ProjectScopeService) {}

  openModal() {
    this.isModalOpen = true;
    this.scopeResult = null;
    this.scopeError = '';
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  analyzeScope(): void {
    const title = (this.projectTitle || '').trim();
    const desc = (this.projectDescription || '').trim();
    if (!title && !desc) {
      this.scopeError = 'Add a title or description first.';
      this.scopeResult = null;
      return;
    }
    this.scopeLoading = true;
    this.scopeError = '';
    this.scopeResult = null;
    this.projectScope.analyzeScope(title, desc).subscribe({
      next: (r) => {
        this.scopeResult = r;
        this.scopeLoading = false;
      },
      error: () => {
        this.scopeLoading = false;
        this.scopeError =
          'Could not reach the project service. Start ProjectMicroService (port 8082) or try again.';
      }
    });
  }
}
