import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectServiceService,
    private competenceService: CompetanceService 
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      const projectId = Number(idParam);
      
      this.competenceService.getAllCompetances().subscribe({
        next: (skills) => {
          this.allSkills = skills;
          this.resolveProjectSkills(); 
        },
        error: (err) => console.error("Erreur chargement catalogue", err)
      });

      this.projectService.getProjectById(projectId).subscribe({
        next: (data) => {
          this.project = data;
          this.isLoading = false;
          this.resolveProjectSkills(); 
        },
        error: (err) => {
          console.error("Erreur lors du chargement du projet", err);
          this.isLoading = false;
        }
      });
    }
  }

  setTab(tab: string) {
    this.currentTab = tab;
  }

  resolveProjectSkills() {
    if (this.project && this.allSkills.length > 0) {
      
      if (this.project.requiredCompetenceIds && this.project.requiredCompetenceIds.length > 0) {
        
        this.projectSkills = this.allSkills.filter(skill => 
          this.project.requiredCompetenceIds!.includes(skill.id)
        );
        
      } else {
        this.projectSkills = [];
      }
    }
  }
}