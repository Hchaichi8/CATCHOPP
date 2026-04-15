import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Project } from '../../models/project.model';
import { ProjectServiceService } from '../../Services/project-service.service';
import { CompetanceService } from '../../Services/competance.service';

@Component({
  selector: 'app-detailclientproject',
  templateUrl: './detailclientproject.component.html',
  styleUrls: ['./detailclientproject.component.css']
})
export class DetailclientprojectComponent implements OnInit {
  
  currentTab: string = 'details';
  project!: Project; 
  isLoading: boolean = true; 
  allSkills: any[] = []; 
  projectSkills: any[] = []; 
  
  // Reviews List
  projectReviews: any[] = [];

  // Ownership & User
  currentUserId: number | null = null;
  isOwner: boolean = false;

  // Review Modal Logic
  showReviewModal: boolean = false;
  reviewText: string = '';
  rating: number = 5;
  isEnhancing: boolean = false;

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
      
      // Load Skills
      this.competenceService.getAllCompetances().subscribe(skills => {
        this.allSkills = skills;
        this.resolveProjectSkills();
      });

      // Load Project
      this.projectService.getProjectById(projectId).subscribe({
        next: (data) => {
          this.project = data;
          this.checkOwnership();
          this.resolveProjectSkills();
          this.fetchProjectReviews(); // Load existing reviews
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  fetchProjectReviews() {
    // Assuming you have an endpoint to get reviews by Project ID
    this.http.get<any[]>(`http://localhost:8085/Review/GetReviewsByProject/${this.project.id}`)
      .subscribe(res => this.projectReviews = res);
  }

  loadCurrentUser() {
    const storedData = localStorage.getItem('currentUser');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const token = parsed.token || storedData;
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        this.currentUserId = payload.id;
      } catch (e) { console.error(e); }
    }
  }

  checkOwnership() {
    if (this.project && this.currentUserId) {
      this.isOwner = Number(this.project.clientId) === Number(this.currentUserId);
    }
  }

  resolveProjectSkills() {
    if (this.project?.requiredCompetenceIds && this.allSkills.length > 0) {
      this.projectSkills = this.allSkills.filter(s => this.project.requiredCompetenceIds!.includes(s.id));
    }
  }

  setTab(tab: string) { this.currentTab = tab; }

  // Review Actions
  openReviewModal() { this.showReviewModal = true; }
  closeReviewModal() { this.showReviewModal = false; this.reviewText = ''; }

  enhanceWithAI() {
    if (!this.reviewText) return;
    this.isEnhancing = true;
    this.http.post<any>('http://localhost:8085/Review/enhance', { text: this.reviewText, rating: this.rating })
      .subscribe({
        next: (res) => { this.reviewText = res.enhancedText; this.isEnhancing = false; },
        error: () => this.isEnhancing = false
      });
  }

  submitReview() {
    const reviewData = {
      description: this.reviewText,
      rating: this.rating,
      projectId: this.project.id,
      clientId: this.currentUserId?.toString(),
      freelancerId: null, // Project review, not user review
      reviewerRole: 'CLIENT',
      createdAt: new Date().toISOString()
    };

    this.http.post('http://localhost:8085/Review/AjouterReview', reviewData).subscribe(() => {
      alert('Review posted!');
      this.fetchProjectReviews(); // Refresh list
      this.closeReviewModal();
    });
  }
}