import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectServiceService } from '../../Services/project-service.service';
import { Proposal } from '../../models/proposal';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | null = null;
  proposals: Proposal[] = []; 
  isLoading: boolean = true;
  
  activeTab: 'job' | 'proposals' = 'job'; 
  isSaved: boolean = false; 
  currentUrl: string = '';

  // --- VARIABLES POUR LES STATISTIQUES ---
  lowestBid: number = 0;
  highestBid: number = 0;
  averageBid: number = 0;

  // ID du freelance connecté (Mocké)
  currentFreelancerId: number = 1;

  // Vérifie si le freelance a déjà postulé
  get hasAlreadyApplied(): boolean {
    return this.proposals.some(p => p.freelancerId === this.currentFreelancerId);
  }

  isProposalModalOpen: boolean = false;
  newProposal: Proposal = {
    bidAmount: 0,
    estimationEndDate: '',
    status: 'PENDING',
    freelancerId: this.currentFreelancerId 
  };

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectServiceService
  ) { }

  ngOnInit(): void {
    this.currentUrl = window.location.href;
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadProjectDetails(Number(idParam));
      this.loadProposals(Number(idParam)); 
    } else {
      this.isLoading = false;
    }
  }

  loadProjectDetails(id: number) {
    this.projectService.getProjectById(id).subscribe({
      next: (data) => { this.project = data; this.isLoading = false; },
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

  openModal() { this.isProposalModalOpen = true; }
  
  closeModal() { 
    this.isProposalModalOpen = false; 
    this.newProposal = { bidAmount: 0, estimationEndDate: '', status: 'PENDING', freelancerId: this.currentFreelancerId }; 
  }

  setTab(tab: 'job' | 'proposals') { this.activeTab = tab; }

  formatEnumText(value: string | undefined): string {
    if (!value) return 'General';
    return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  toggleSave() { this.isSaved = !this.isSaved; }
  copyLink() { navigator.clipboard.writeText(this.currentUrl).then(() => alert('Link copied! 📋')); }
}