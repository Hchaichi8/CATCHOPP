import { Component , ElementRef,HostListener, OnInit} from '@angular/core';
import { Project } from '../../models/project.model';
import { ProjectServiceService } from '../../Services/project-service.service';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-client-feed',
  templateUrl: './client-feed.component.html',
  styleUrl: './client-feed.component.css'
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

  constructor(
    private eRef: ElementRef,
    private projectService: ProjectServiceService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // On charge le profil EN PREMIER, et à l'intérieur ça chargera les projets
    this.loadUserData(); 
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
                
                // Maintenant qu'on sait qui est connecté, on charge les projets
                this.loadProjects(); 
              },
              error: (err) => {
                console.error("Erreur Backend Profil :", err);
                this.loadProjects(); // On charge quand même les projets en cas d'erreur
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

        // 🟢 RESTAURATION DES RÉACTIONS APRÈS LE F5
        this.projectsList.forEach(p => {
          if (this.currentUser && p.id) {
            const savedReaction = localStorage.getItem(`reaction_${this.currentUser.id}_${p.id}`);
            if (savedReaction) {
              p.myReaction = savedReaction;
            }
          }
        });

        this.filteredProjects = [...this.projectsList]; 
      },
      error: (err) => {
        console.error("Failed to load projects", err);
      }
    });
  }

  // --- LOGIQUE DE FILTRAGE ---
  applyFilters() {
    let temp = [...this.projectsList];

    if (this.searchText.trim() !== '') {
      const search = this.searchText.toLowerCase();
      temp = temp.filter(p => p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }

    if (this.selectedExperience !== 'All') {
      temp = temp.filter(p => p.ExperienceLevel === this.selectedExperience);
    }

    if (this.selectedCategory !== 'All') {
      temp = temp.filter(p => p.category === this.selectedCategory);
    }

    // Tri
    if (this.selectedSort === 'Newest') temp.sort((a, b) => (b.id || 0) - (a.id || 0));
    else if (this.selectedSort === 'Oldest') temp.sort((a, b) => (a.id || 0) - (b.id || 0));
    else if (this.selectedSort === 'Highest Budget') temp.sort((a, b) => b.budget - a.budget);
    else if (this.selectedSort === 'Lowest Budget') temp.sort((a, b) => a.budget - b.budget);

    this.filteredProjects = temp;
  }

  clearFilters() {
    this.searchText = '';
    this.selectedExperience = 'All';
    this.selectedCategory = 'All';
    this.selectedSort = 'Newest';
    this.applyFilters();
  }

  // --- FORMULAIRE ---
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
      clientId: this.currentUser ? this.currentUser.id : 1
    };
  }

  formatEnumText(value: string | undefined): string {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
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

    this.project.postedAt = new Date().toISOString().split('T')[0];

    this.projectService.addProject(this.project).subscribe({
      next: (response) => {
        console.log("Created:", response);
        alert("Project created successfully 🚀");
        this.closeProjectModal();
        this.loadProjects(); // Recharge la liste pour afficher le nouveau
      },
      error: (err) => {
        console.error(err);
        alert("Server error ❌");
      }
    });
  }
  
  resetForm() {
    this.project = this.getDefaultProject();
    if (this.currentUser) {
       this.project.clientId = this.currentUser.id;
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.project.image = e.target.result; 
      };
      reader.readAsDataURL(file);
    }
  }
  
  getTotalReactions(p: Project): number {
    return (p.likes || 0) + (p.loves || 0) + (p.hahas || 0) + (p.supports || 0);
  }

  // 🟢 LOGIQUE DE RÉACTION AVEC SAUVEGARDE LOCALE
  react(project: Project, type: string) {
    if (!project.id) return;

    project.justReacted = true;
    setTimeout(() => {
      project.justReacted = false;
    }, 500); 

    // Annule si on clique sur la même chose
    if (project.myReaction === type) return;

    // Retire l'ancienne réaction des compteurs
    if (project.myReaction) {
      if (project.myReaction === 'LIKE') project.likes = (project.likes || 1) - 1;
      if (project.myReaction === 'LOVE') project.loves = (project.loves || 1) - 1;
      if (project.myReaction === 'HAHA') project.hahas = (project.hahas || 1) - 1;
      if (project.myReaction === 'SUPPORT') project.supports = (project.supports || 1) - 1;
    }

    // Applique la nouvelle
    project.myReaction = type;
    if (type === 'LIKE') project.likes = (project.likes || 0) + 1;
    if (type === 'LOVE') project.loves = (project.loves || 0) + 1;
    if (type === 'HAHA') project.hahas = (project.hahas || 0) + 1;
    if (type === 'SUPPORT') project.supports = (project.supports || 0) + 1;

    // Sauvegarde dans le localStorage (Pour résister au F5)
    if (this.currentUser) {
      localStorage.setItem(`reaction_${this.currentUser.id}_${project.id}`, type);
    }

    this.projectService.reactToProject(project.id, type).subscribe({
      next: () => console.log(`Réaction ${type} enregistrée !`),
      error: (err) => console.error("Erreur serveur", err)
    });
  }
}