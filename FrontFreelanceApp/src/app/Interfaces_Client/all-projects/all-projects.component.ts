import { Component, HostListener, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { ProjectServiceService } from '../../Services/project-service.service';

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  styleUrl: './all-projects.component.css'
})
export class AllProjectsComponent implements OnInit{

  // On utilise les statuts de ton backend (OPEN, DRAFT, CLOSED)
  selectedTab: string = 'OPEN'; 
  
  projects: Project[] = []; // Tous les projets du client
  activeMenuId: number | null = null; // Pour le menu 3 points
  searchText: string = ''; // Pour la barre de recherche

  constructor(private projectService: ProjectServiceService) {}

  ngOnInit(): void {
    this.loadMyProjects();
  }

  loadMyProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        // Optionnel : Ici tu pourras filtrer par clientId quand tu géreras la connexion
        // ex: this.projects = data.filter(p => p.clientId === MON_ID).reverse();
        this.projects = data.reverse(); 
      },
      error: (err) => console.error("Erreur de chargement", err)
    });
  }

  // Helper pour filtrer les projets dans le HTML en temps réel
  get filteredProjects() {
    return this.projects.filter(p => {
      // 1. Vérifie le statut (Si p.status est null, on le considère comme OPEN par défaut)
      const currentStatus = p.status ? p.status : 'OPEN';
      const matchesStatus = currentStatus === this.selectedTab;
      
      // 2. Vérifie la recherche par titre
      const matchesSearch = p.title.toLowerCase().includes(this.searchText.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  // Calcule le nombre de projets pour les badges des onglets
  getCount(status: string): number {
    return this.projects.filter(p => (p.status ? p.status : 'OPEN') === status).length;
  }

  setTab(tab: string) {
    this.selectedTab = tab;
  }

  // Formatage pour l'Enum Catégorie (ex: WEB_DEVELOPMENT -> Web Development)
  formatEnumText(value: string | undefined): string {
    if (!value) return 'Uncategorized';
    return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  // --- LOGIQUE DU MENU 3 POINTS ---
  toggleMenu(id: number | undefined, event: MouseEvent) {
    if (!id) return;
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu() {
    this.activeMenuId = null;
  }

  // --- ACTIONS DU MENU ---
  editProject(id: number | undefined) {
    if (!id) return;
    console.log("Edit project", id);
    // TODO: Ouvrir la modal d'édition
    this.activeMenuId = null; 
  }

  closeJob(id: number | undefined) {
    if (!id) return;
    if (confirm("Are you sure you want to close this job? Freelancers will no longer be able to apply.")) {
      console.log("Close project", id);
      // TODO: this.projectService.updateStatus(id, 'CLOSED').subscribe(...)
    }
    this.activeMenuId = null; 
  }

  deleteProject(id: number | undefined) {
    if (!id) return;
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      console.log("Delete project", id);
      // TODO: this.projectService.deleteProject(id).subscribe(...)
    }
    this.activeMenuId = null; 
  }
}