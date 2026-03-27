import { Component } from '@angular/core';

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrl: './all-projects.component.css'
})
export class AllProjectsComponent {
  selectedTab: 'active' | 'draft' | 'closed' = 'active';

  // Mock Data
  projects = [
    {
      id: 8291,
      title: 'Senior Angular Developer for SaaS Dashboard',
      category: 'Web Development',
      postedDate: 'Oct 24, 2025',
      proposals: 8,
      hires: 0,
      budget: '$45 - $60 / hr',
      status: 'active'
    },
    {
      id: 8292,
      title: 'UI/UX Design for Fintech Mobile App',
      category: 'Design',
      postedDate: 'Oct 20, 2025',
      proposals: 15,
      hires: 1,
      budget: '$1,200 Fixed',
      status: 'active'
    },
    {
      id: 8295,
      title: 'Marketing Campaign for Holiday Season',
      category: 'Marketing',
      postedDate: 'Oct 15, 2025',
      proposals: 0,
      hires: 0,
      budget: '$500 Fixed',
      status: 'draft'
    },
    {
      id: 8100,
      title: 'Python Script for Data Scraping',
      category: 'Development',
      postedDate: 'Sep 10, 2025',
      proposals: 24,
      hires: 1,
      budget: '$200 Fixed',
      status: 'closed'
    }
  ];

  // Helper to filter projects in the HTML
  get filteredProjects() {
    return this.projects.filter(p => p.status === this.selectedTab);
  }

  setTab(tab: 'active' | 'draft' | 'closed') {
    this.selectedTab = tab;
  }

}
