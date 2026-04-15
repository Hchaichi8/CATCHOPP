import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectServiceService } from '../../Services/project-service.service';
import { Proposal } from '../../models/proposal';
import { UserService } from '../../Services/user.service'; 
import { CompetanceService } from '../../Services/competance.service'; // 🟢 Ajout du service des compétences
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  
  // State
  activeTab: string = 'job';
  isLoading: boolean = true;
  project!: Project;
  projectSkills: any[] = [];
  allSkills: any[] = [];
  proposals: any[] = [];
  
  // Review Logic
  projectReviews: any[] = [];
  showReviewModal: boolean = false;
  reviewText: string = '';
  rating: number = 5;
  isEnhancing: boolean = false;

  // User Context
  currentUser: any = null;
  currentFreelancerId: number | null = null;
  hasAlreadyApplied: boolean = false;
  isSaved: boolean = false;
  currentUrl: string = window.location.href;

  // Stats
  lowestBid: number = 0;
  averageBid: number = 0;
  highestBid: number = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectServiceService,
    private competenceService: CompetanceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      const projectId = Number(idParam);
      
      // Load Skills Reference
      this.competenceService.getAllCompetances().subscribe(skills => {
        this.allSkills = skills;
        this.resolveProjectSkills();
      });

      // Load Project Details
      this.projectService.getProjectById(projectId).subscribe({
        next: (data) => {
          this.project = data;
          this.resolveProjectSkills();
          this.fetchProjectReviews(); // Load Reviews
          this.loadProposals(projectId);
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  loadCurrentUser() {
    const storedData = localStorage.getItem('currentUser');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        this.currentUser = parsed;
        const token = parsed.token || storedData;
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        this.currentFreelancerId = payload.id;
      } catch (e) { console.error('Auth Error', e); }
    }
  }

  fetchProjectReviews() {
    this.http.get<any[]>(`http://localhost:8085/Review/GetReviewsByProject/${this.project.id}`)
      .subscribe(res => this.projectReviews = res);
  }

  loadProposals(projectId: number) {
    // Replace with your real proposals endpoint
    this.http.get<any[]>(`http://localhost:8082/proposals/project/${projectId}`)
      .subscribe(res => {
        this.proposals = res;
        this.calculateStats();
        this.hasAlreadyApplied = this.proposals.some(p => p.freelancerId === this.currentFreelancerId);
      });
  }

  calculateStats() {
    if (this.proposals.length > 0) {
      const bids = this.proposals.map(p => p.bidAmount);
      this.lowestBid = Math.min(...bids);
      this.highestBid = Math.max(...bids);
      this.averageBid = Math.round(bids.reduce((a, b) => a + b, 0) / bids.length);
    }
  }

  resolveProjectSkills() {
    if (this.project?.requiredCompetenceIds && this.allSkills.length > 0) {
      this.projectSkills = this.allSkills.filter(s => this.project.requiredCompetenceIds!.includes(s.id));
    }
  }

  setTab(tab: string) { this.activeTab = tab; }

  // --- Review Actions ---
  openReviewModal() { this.showReviewModal = true; }
  closeReviewModal() { this.showReviewModal = false; this.reviewText = ''; this.rating = 5; }

  enhanceWithAI() {
    if (!this.reviewText) return;
    this.isEnhancing = true;
    this.http.post<any>('http://localhost:8085/Review/enhance', { text: this.reviewText, rating: this.rating })
      .subscribe({
        next: (res) => { 
          this.reviewText = res.enhancedText; 
          this.isEnhancing = false; 
        },
        error: () => this.isEnhancing = false
      });
  }

  submitReview() {
    const reviewData = {
      description: this.reviewText,
      rating: this.rating,
      projectId: this.project.id,
      freelancerId: this.currentFreelancerId?.toString(),
      reviewerRole: 'FREELANCER',
      createdAt: new Date().toISOString()
    };

    this.http.post('http://localhost:8085/Review/AjouterReview', reviewData).subscribe(() => {
      alert('Review posted successfully!');
      this.fetchProjectReviews(); 
      this.closeReviewModal();
    });
  }

  // UI Helpers
  formatEnumText(text: any): string {
    if (!text) return '';
    return text.toString().replace(/_/g, ' ');
  }

  toggleSave() { this.isSaved = !this.isSaved; }
  copyLink() {
    navigator.clipboard.writeText(this.currentUrl);
    alert('Link copied!');
  }
}