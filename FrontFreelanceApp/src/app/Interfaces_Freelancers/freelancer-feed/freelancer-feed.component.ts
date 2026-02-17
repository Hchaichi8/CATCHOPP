import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { ProjectServiceService } from '../../Services/project-service.service';

@Component({
  selector: 'app-freelancer-feed',
  templateUrl: './freelancer-feed.component.html',
  styleUrl: './freelancer-feed.component.css'
})
export class FreelancerFeedComponent implements OnInit {
allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  
  // --- NOUVEAU : LISTE DES PROJETS SAUVEGARDÉS ---
  savedProjects: Project[] = [];

  searchText: string = '';
  sortBy: string = 'Newest';
  selectedBudget: string = 'Any';

  categories = [
    { label: 'Web Development', value: 'WEB_DEVELOPMENT', selected: false },
    { label: 'Mobile Apps', value: 'MOBILE_DEVELOPMENT', selected: false },
    { label: 'UI/UX Design', value: 'UI_UX_DESIGN', selected: false },
    { label: 'Digital Marketing', value: 'DIGITAL_MARKETING', selected: false },
    { label: 'Data & AI', value: 'DATA_SCIENCE_AI', selected: false }
  ];

  jobTypes = [
    { label: 'Hourly', value: 'HOURLY', selected: false },
    { label: 'Fixed Price', value: 'FIXED_PRICE', selected: false }
  ];

  constructor(private projectService: ProjectServiceService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.allProjects = data.filter(p => !p.status || p.status === 'OPEN').reverse();
        this.applyFilters();
      },
      error: (err) => console.error("Error loading projects", err)
    });
  }

  applyFilters() {
    let temp = [...this.allProjects];

    if (this.searchText.trim() !== '') {
      const query = this.searchText.toLowerCase();
      temp = temp.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    const selectedCats = this.categories.filter(c => c.selected).map(c => c.value);
    if (selectedCats.length > 0) {
      temp = temp.filter(p => p.category && selectedCats.includes(p.category));
    }

    const selectedTypes = this.jobTypes.filter(t => t.selected).map(t => t.value);
    if (selectedTypes.length > 0) {
      temp = temp.filter(p => p.jobType && selectedTypes.includes(p.jobType));
    }

    if (this.selectedBudget !== 'Any') {
      temp = temp.filter(p => {
        if (!p.budget) return false;
        if (this.selectedBudget === '100-500') return p.budget >= 100 && p.budget <= 500;
        if (this.selectedBudget === '500-1000') return p.budget > 500 && p.budget <= 1000;
        if (this.selectedBudget === '1000+') return p.budget > 1000;
        return true;
      });
    }

    if (this.sortBy === 'Newest') {
      temp.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (this.sortBy === 'Budget (High-Low)') {
      temp.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    }

    this.filteredProjects = temp;
  }

  formatEnumText(value: string | undefined): string {
    if (!value) return 'General';
    return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  clearFilters() {
    this.searchText = '';
    this.selectedBudget = 'Any';
    this.categories.forEach(c => c.selected = false);
    this.jobTypes.forEach(t => t.selected = false);
    this.applyFilters();
  }

  // --- NOUVELLES FONCTIONS POUR LA SAUVEGARDE ---
  isSaved(projectId: number | undefined): boolean {
    if (!projectId) return false;
    return this.savedProjects.some(p => p.id === projectId);
  }

  toggleSave(project: Project, event: Event) {
    event.stopPropagation(); // Empêche d'ouvrir la page détails en cliquant sur le cœur
    if (this.isSaved(project.id)) {
      this.savedProjects = this.savedProjects.filter(p => p.id !== project.id);
    } else {
      this.savedProjects.push(project);
    }
  }
}