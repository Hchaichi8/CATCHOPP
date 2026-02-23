import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectServiceService } from '../../Services/project-service.service';
import { Proposal } from '../../models/proposal';
import { UserService } from '../../Services/user.service'; 

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | null = null;
  proposals: Proposal[] = []; 
  isLoading: boolean = true;
  
  activeTab: 'job' | 'proposals' = 'job'; 
  isSaved: boolean = false; 
  currentUrl: string = '';

 
  lowestBid: number = 0;
  highestBid: number = 0;
  averageBid: number = 0;

  currentUser: any = null;
  currentFreelancerId: number | null = null;


  get hasAlreadyApplied(): boolean {
    if (!this.currentFreelancerId) return false;
    return this.proposals.some(p => p.freelancerId === this.currentFreelancerId);
  }

  isProposalModalOpen: boolean = false;
  
  newProposal: Proposal = {
    bidAmount: 0,
    estimationEndDate: '',
    status: 'PENDING',
    freelancerId: 0 
  };

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectServiceService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.currentUrl = window.location.href;
    this.loadUserData();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadProjectDetails(Number(idParam));
      this.loadProposals(Number(idParam)); 
    } else {
      this.isLoading = false;
    }
  }

  loadUserData() {
    const storedData = localStorage.getItem('currentUser');
    if (storedData) {
      try {
        let token = storedData.includes('token') ? JSON.parse(storedData).token : storedData;
        if (token) {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
          this.currentFreelancerId = decodedPayload.id;

          if (this.currentFreelancerId) {
            this.userService.getUserById(this.currentFreelancerId).subscribe({
              next: (user) => {
                this.currentUser = user;
                this.checkIfSaved();
              },
              error: (err) => console.error("Erreur Backend Profil :", err)
            });
          }
        }
      } catch (e) {
        console.error("Erreur de décodage du token :", e);
      }
    }
  }

  loadProjectDetails(id: number) {
    this.projectService.getProjectById(id).subscribe({
      next: (data) => { 
        this.project = data; 
        this.isLoading = false; 
        this.checkIfSaved(); 
      },
      error: (err) => { console.error(err); this.isLoading = false; }
    });
  }

  loadProposals(projectId: number) {
    this.projectService.getProposalsForProject(projectId).subscribe({
      next: (data) => { 
        this.proposals = data.reverse(); 
        this.calculateBidStats(); 
      }, 
      error: (err) => console.error("Error loading proposals", err)
    });
  }

  calculateBidStats() {
    if (!this.proposals || this.proposals.length === 0) {
      this.lowestBid = 0;
      this.highestBid = 0;
      this.averageBid = 0;
      return;
    }

    const bids = this.proposals.map(p => p.bidAmount);
    
    this.lowestBid = Math.min(...bids);
    this.highestBid = Math.max(...bids);
    
    const sum = bids.reduce((a, b) => a + b, 0);
    this.averageBid = Math.round(sum / bids.length);
  }

  openModal() { 
    if (!this.currentFreelancerId) {
      alert("You must be logged in to submit a proposal.");
      return;
    }
    
    this.newProposal.freelancerId = this.currentFreelancerId;
    this.isProposalModalOpen = true; 
    document.body.style.overflow = 'hidden';
  }
  
  closeModal() { 
    this.isProposalModalOpen = false; 
    document.body.style.overflow = 'auto';
    this.newProposal = { bidAmount: 0, estimationEndDate: '', status: 'PENDING', freelancerId: this.currentFreelancerId || 0 }; 
  }

  submitProposal() {
    if (!this.project?.id) return;
    if (!this.newProposal.bidAmount || !this.newProposal.estimationEndDate) {
      alert("Please fill all fields!");
      return;
    }

    this.projectService.submitProposal(this.project.id, this.newProposal).subscribe({
      next: (res) => {
        alert("Proposal submitted successfully! 🚀");
        this.closeModal();
        this.loadProposals(this.project!.id!); 
        this.activeTab = 'proposals'; 
      },
      error: (err) => alert("Error submitting proposal.")
    });
  }

  checkIfSaved() {
    if (this.currentUser && this.project && this.project.id) {
      const savedStr = localStorage.getItem(`saved_jobs_${this.currentUser.id}`);
      if (savedStr) {
        const savedArr: Project[] = JSON.parse(savedStr);
        this.isSaved = savedArr.some(p => p.id === this.project!.id);
      }
    }
  }

  toggleSave() { 
    if (!this.currentUser || !this.project) return;

    this.isSaved = !this.isSaved; 
    
    let savedArr: Project[] = [];
    const savedStr = localStorage.getItem(`saved_jobs_${this.currentUser.id}`);
    if (savedStr) savedArr = JSON.parse(savedStr);

    if (this.isSaved) {
      // Ajouter s'il n'y est pas déjà
      if (!savedArr.some(p => p.id === this.project!.id)) {
        savedArr.push(this.project);
      }
    } else {
      // Retirer
      savedArr = savedArr.filter(p => p.id !== this.project!.id);
    }

    localStorage.setItem(`saved_jobs_${this.currentUser.id}`, JSON.stringify(savedArr));
  }

  setTab(tab: 'job' | 'proposals') { this.activeTab = tab; }

  formatEnumText(value: string | undefined): string {
    if (!value) return 'General';
    return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  copyLink() { navigator.clipboard.writeText(this.currentUrl).then(() => alert('Link copied! 📋')); }
}