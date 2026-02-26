import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { ProjectServiceService } from '../../Services/project-service.service';
import { UserService } from '../../Services/user.service';
import { CompetanceService } from '../../Services/competance.service';
import { Router } from '@angular/router'; // 🟢 Ajout du Router

@Component({
  selector: 'app-client-feed',
  templateUrl: './client-feed.component.html',
  styleUrls: ['./client-feed.component.css']
})
export class ClientFeedComponent implements OnInit {

  isProjectModalOpen: boolean = false;
  isMessagesOpen: boolean = false;
  
  projectsList: Project[] = []; 
  filteredProjects: Project[] = []; 

  searchText: string = '';
  selectedExperience: string = 'All';
  selectedCategory: string = 'All';
  selectedSort: string = 'Newest';

  project: Project = this.getDefaultProject(); 
  currentUser: any = null;

  clientDetailsMap: { [key: number]: any } = {};

  allSkills: any[] = [];
  selectedSkills: Set<number> = new Set();
  skillSearchText: string = '';

  // 🟢 NOUVELLES VARIABLES POUR LA RECHERCHE DE FREELANCERS
  allFreelancers: any[] = [];
  filteredFreelancers: any[] = [];
  showFreelancerDropdown: boolean = false;

  constructor(
    private eRef: ElementRef,
    private projectService: ProjectServiceService,
    private userService: UserService,
    private competenceService: CompetanceService,
    private router: Router // 🟢 Injection du Router
  ) {}

  ngOnInit(): void {
    this.loadUserData(); 
    this.loadSkills(); 
    this.loadAllFreelancers(); // 🟢 On charge les freelancers pour la barre de recherche
  }

  // ==========================================
  // 🟢 LOGIQUE DE RECHERCHE FREELANCER
  // ==========================================
  loadAllFreelancers() {
    // On suppose que ton UserService a une méthode getAllUsers() (sinon il faudra l'ajouter backend/frontend)
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        // On ne garde que les utilisateurs qui ont le rôle FREELANCER
        this.allFreelancers = users.filter(u => u.role === 'FREELANCER');
      },
      error: (err) => console.error("Erreur chargement des freelancers", err)
    });
  }

  onGlobalSearch() {
    // 1. On filtre les projets du Feed (ancienne logique)
    this.applyFilters();

    // 2. On filtre les Freelancers pour le menu déroulant
    const query = this.searchText.trim().toLowerCase();
    
    if (query.length > 0) {
      this.filteredFreelancers = this.allFreelancers.filter(f => 
        (f.firstName && f.firstName.toLowerCase().includes(query)) ||
        (f.lastName && f.lastName.toLowerCase().includes(query)) ||
        (f.bio && f.bio.toLowerCase().includes(query)) // Cherche aussi dans leur Bio !
      );
      this.showFreelancerDropdown = true;
    } else {
      this.showFreelancerDropdown = false;
    }
  }

  hideFreelancerDropdown() {
    // Petit délai pour laisser le temps au clic de s'exécuter avant de cacher la liste
    setTimeout(() => {
      this.showFreelancerDropdown = false;
    }, 200);
  }

  goToFreelancerProfile(freelancerId: number) {
    // Redirige vers le profil public du freelancer
    this.router.navigate(['/FreelancerProfil', freelancerId]);
  }

  // ==========================================
  // RESTE DU CODE (Ne change pas)
  // ==========================================
  loadSkills() {
    this.competenceService.getAllCompetances().subscribe({
      next: (data) => {
        this.allSkills = data.filter(skill => String(skill.userId) === '5');
      },
      error: (err) => console.error("Erreur chargement skills", err)
    });
  }

  get filteredSkillsArray() {
    if (!this.skillSearchText) return this.allSkills;
    const lower = this.skillSearchText.toLowerCase();
    return this.allSkills.filter(s => s.nom.toLowerCase().includes(lower));
  }

  toggleSkill(skillId: number) {
    if (this.selectedSkills.has(skillId)) {
      this.selectedSkills.delete(skillId);
    } else {
      this.selectedSkills.add(skillId);
    }
  }

  isSkillSelected(skillId: number): boolean {
    return this.selectedSkills.has(skillId);
  }

  loadUserData() {
    const storedData = localStorage.getItem('currentUser');
    if (storedData) {
      try {
        let token = storedData.includes('token') ? JSON.parse(storedData).token : storedData;
        if (token) {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
          const currentUserId = decodedPayload.id;

          if (currentUserId) {
            this.userService.getUserById(currentUserId).subscribe({
              next: (user) => {
                this.currentUser = user;
                this.project.clientId = user.id; 
                this.loadProjects(); 
              },
              error: (err) => {
                console.error("Erreur Backend Profil :", err);
                this.loadProjects(); 
              }
            });
          }
        }
      } catch (e) {
        console.error("Erreur de décodage du token :", e);
        this.loadProjects();
      }
    } else {
      this.loadProjects();
    }
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projectsList = data.reverse(); 

        const uniqueClientIds = [...new Set(this.projectsList.map(p => p.clientId).filter(id => id != null))];
        
        uniqueClientIds.forEach(id => {
          if (id && !this.clientDetailsMap[id]) {
            this.userService.getUserById(id).subscribe({
              next: (user) => {
                this.clientDetailsMap[id] = user;
              },
              error: (err) => console.error(`Impossible de charger le client ${id}`, err)
            });
          }
        });

        this.projectsList.forEach(p => {
          if (this.currentUser && p.id) {
            const savedReaction = localStorage.getItem(`reaction_${this.currentUser.id}_${p.id}`);
            if (savedReaction) {
              p.myReaction = savedReaction;
            }
          }
        });

        this.applyFilters(); 
      },
      error: (err) => console.error("Failed to load projects", err)
    });
  }

  applyFilters() {
    let temp = [...this.projectsList];

    if (this.searchText.trim() !== '') {
      const search = this.searchText.toLowerCase();
      temp = temp.filter(p => p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }

    if (this.selectedExperience !== 'All') temp = temp.filter(p => p.ExperienceLevel === this.selectedExperience);
    if (this.selectedCategory !== 'All') temp = temp.filter(p => p.category === this.selectedCategory);

    if (this.selectedSort === 'Newest') temp.sort((a, b) => (b.id || 0) - (a.id || 0));
    else if (this.selectedSort === 'Oldest') temp.sort((a, b) => (a.id || 0) - (b.id || 0));
    else if (this.selectedSort === 'Highest Budget') temp.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    else if (this.selectedSort === 'Lowest Budget') temp.sort((a, b) => (a.budget || 0) - (b.budget || 0));

    this.filteredProjects = temp;
  }

  clearFilters() {
    this.searchText = '';
    this.selectedExperience = 'All';
    this.selectedCategory = 'All';
    this.selectedSort = 'Newest';
    this.applyFilters();
  }

  getDefaultProject(): Project {
    return {
      title: '',
      description: '',
      image: '',
      ExperienceLevel: 'Intermediate',
      category: 'WEB_DEVELOPMENT',
      jobType: 'FIXED_PRICE',
      budget: 0,
      postedAt: '',
      status: 'OPEN',
      clientId: this.currentUser ? this.currentUser.id : 1,
      requiredCompetenceIds: [] 
    };
  }

  openProjectModal() {
    this.isProjectModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeProjectModal() {
    this.isProjectModalOpen = false;
    document.body.style.overflow = 'auto';
    this.resetForm();
  }

  publishProject() {
    if (!this.project.title || !this.project.description || !this.project.budget) {
      alert("Please fill all required fields");
      return;
    }

    this.project.requiredCompetenceIds = Array.from(this.selectedSkills);
    this.project.postedAt = new Date().toISOString().split('T')[0];

    this.projectService.addProject(this.project).subscribe({
      next: (response) => {
        alert("Project created successfully 🚀");
        this.closeProjectModal();
        this.loadProjects(); 
      },
      error: (err) => {
        console.error(err);
        alert("Server error ❌");
      }
    });
  }

  resetForm() {
    this.project = this.getDefaultProject();
    if (this.currentUser) this.project.clientId = this.currentUser.id;
    this.selectedSkills.clear(); 
    this.skillSearchText = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.project.image = e.target.result; 
      reader.readAsDataURL(file);
    }
  }

  toggleMessages() {
    this.isMessagesOpen = !this.isMessagesOpen;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isMessagesOpen = false;
    }
  }

  formatEnumText(value: string | undefined): string {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  getTotalReactions(p: Project): number {
    return (p.likes || 0) + (p.loves || 0) + (p.hahas || 0) + (p.supports || 0);
  }

  react(project: Project, type: string) {
    if (!project.id) return;

    project.justReacted = true;
    setTimeout(() => project.justReacted = false, 500); 

    if (project.myReaction === type) return;

    if (project.myReaction) {
      if (project.myReaction === 'LIKE') project.likes = (project.likes || 1) - 1;
      if (project.myReaction === 'LOVE') project.loves = (project.loves || 1) - 1;
      if (project.myReaction === 'HAHA') project.hahas = (project.hahas || 1) - 1;
      if (project.myReaction === 'SUPPORT') project.supports = (project.supports || 1) - 1;
    }

    project.myReaction = type;
    if (type === 'LIKE') project.likes = (project.likes || 0) + 1;
    if (type === 'LOVE') project.loves = (project.loves || 0) + 1;
    if (type === 'HAHA') project.hahas = (project.hahas || 0) + 1;
    if (type === 'SUPPORT') project.supports = (project.supports || 0) + 1;

    if (this.currentUser) {
      localStorage.setItem(`reaction_${this.currentUser.id}_${project.id}`, type);
    }

    this.projectService.reactToProject(project.id, type).subscribe({
      next: () => console.log(`Réaction ${type} enregistrée !`),
      error: (err) => console.error("Erreur serveur", err)
    });
  }
}