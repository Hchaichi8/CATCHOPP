import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../models/project.model';
import { ProjectServiceService } from '../../Services/project-service.service';

@Component({
  selector: 'app-detailclientproject',
  templateUrl: './detailclientproject.component.html',
  styleUrl: './detailclientproject.component.css'
})
export class DetailclientprojectComponent {
  currentTab: string = 'details';

  setTab(tab: string) {
    this.currentTab = tab;
  }


  project!: Project; 
  isLoading: boolean = true; 

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectServiceService
  ) {}

  ngOnInit(): void {
    
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      const projectId = Number(idParam);
      
      this.projectService.getProjectById(projectId).subscribe({
        next: (data) => {
          this.project = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Erreur lors du chargement du projet", err);
          this.isLoading = false;
        }
      });
    }
  }
}
