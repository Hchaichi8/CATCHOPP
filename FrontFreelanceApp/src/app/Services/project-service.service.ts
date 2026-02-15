import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectServiceService {

    constructor(private http:HttpClient) { }  
  private url ='http://localhost:8082/Project'
 

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.url}/newproject`, project);
  }
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.url}/allprojects`);
  }
  reactToProject(projectId: number, reactionType: string): Observable<Project> {
    return this.http.put<Project>(`${this.url}/${projectId}/react?type=${reactionType}`, {});
  }
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.url}/${id}`);
  }
  getArticlesByCategory(categoryId: string): Observable<any> {
    return this.http.get(`${this.url}article/getArticlesby/${categoryId}`);
  }
    getarticlebyid(id:any)
  {
    return this.http.get(`${this.url}article/getbyid/${id}`);
  }
}
