import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectServiceService } from '../../Services/project-service.service';
import { Proposal } from '../../models/proposal';


@Component({
  selector: 'app-project-proposals',
  templateUrl: './project-proposals.component.html',
  styleUrl: './project-proposals.component.css'
})
export class ProjectProposalsComponent implements OnInit {
  
  projectId: number | null = null;
  project: Project | null = null;
  proposals: Proposal[] = [];
  
  isLoading: boolean = true;
  
  // Statistiques calculées dynamiquement
  averageBid: number = 0;
  shortlistedCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectServiceService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.projectId = Number(idParam);
      this.loadProjectDetails(this.projectId);
      this.loadProposals(this.projectId);
    } else {
      this.isLoading = false;
    }
  }

  loadProjectDetails(id: number) {
    this.projectService.getProjectById(id).subscribe({
      next: (data) => this.project = data,
      error: (err) => console.error("Error loading project details", err)
    });
  }

  loadProposals(projectId: number) {
    this.projectService.getProposalsForProject(projectId).subscribe({
      next: (data) => {
        this.proposals = data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading proposals", err);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    if (this.proposals.length === 0) {
      this.averageBid = 0;
      this.shortlistedCount = 0;
      return;
    }

    const totalBids = this.proposals.reduce((sum, p) => sum + p.bidAmount, 0);
    this.averageBid = Math.round(totalBids / this.proposals.length);
    
    // On compte combien ont été acceptés (shortlisted)
    this.shortlistedCount = this.proposals.filter(p => p.status === 'ACCEPTED').length;
  }

  // --- NOUVEAU : Mettre à jour le statut via le backend ---
  updateStatus(proposalId: number | undefined, newStatus: string) {
    if (!proposalId) return;

    // Appel HTTP PUT vers ton backend Spring Boot
    this.projectService.updateProposalStatus(proposalId, newStatus).subscribe({
      next: (updatedProposal) => {
        // Mettre à jour la proposition dans la liste locale
        const index = this.proposals.findIndex(p => p.id === proposalId);
        if (index !== -1) {
          this.proposals[index].status = newStatus;
          this.calculateStats(); // Recalculer les stats (Shortlisted count)
        }
      },
      error: (err) => alert("Failed to update status. Please try again.")
    });
  }

}