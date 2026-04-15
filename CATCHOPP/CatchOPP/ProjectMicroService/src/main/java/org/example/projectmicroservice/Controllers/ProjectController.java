package org.example.projectmicroservice.Controllers;

import org.example.projectmicroservice.Dto.ProjectScopeAnalysisDto;
import org.example.projectmicroservice.Dto.ProjectScopeRequest;
import org.example.projectmicroservice.Entities.Project;
import org.example.projectmicroservice.Entities.Proposal;
import org.example.projectmicroservice.Entities.StatusProposal;
import org.example.projectmicroservice.Services.ProjectScopeAiService;
import org.example.projectmicroservice.Services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Project")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService service;

    @Autowired
    private ProjectScopeAiService projectScopeAiService;

    /** AI-assisted check: vague scope, missing budget/timeline/tech, unrealistic expectations */
    @PostMapping("/ai/analyze-scope")
    public ProjectScopeAnalysisDto analyzeProjectScope(@RequestBody ProjectScopeRequest body) {
        if (body == null) {
            body = new ProjectScopeRequest();
        }
        return projectScopeAiService.analyze(body.getTitle(), body.getDescription());
    }

    @PostMapping("/newproject")
    public Project createProject(@RequestBody Project project) {
        return service.createProject(project);
    }

    @GetMapping("/allprojects")
    public List<Project> getAllProjects() {
        return service.getAllProjects();
    }


    @PostMapping("/{projectId}/proposals")
    public Proposal submitProposal(@PathVariable Long projectId, @RequestBody Proposal proposal) {
        return service.createProposal(projectId, proposal);
    }

    // 4. View all proposals for a specific project (Client action)
    @GetMapping("/{projectId}/proposals")
    public List<Proposal> getProposals(@PathVariable Long projectId) {
        return service.getProposalsForProject(projectId);
    }
    @PutMapping("/proposals/{proposalId}/status")
    public Proposal updateStatus(@PathVariable Long proposalId, @RequestParam StatusProposal status) {
        return service.updateProposalStatus(proposalId, status);
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return service.getProjectById(id);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody Project project) {
        return service.updateProject(id, project);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        service.deleteProject(id);
    }

    @GetMapping("/proposals/all")
    public java.util.List<Proposal> getAllProposals() {
        return service.getAllProposals();
    }

    @GetMapping("/proposals/{id}")
    public Proposal getProposalById(@PathVariable Long id) {
        return service.getProposalById(id);
    }

    @PutMapping("/proposals/{id}")
    public Proposal updateProposal(@PathVariable Long id, @RequestBody Proposal proposal) {
        return service.updateProposal(id, proposal);
    }

    @DeleteMapping("/proposals/{id}")
    public void deleteProposal(@PathVariable Long id) {
        service.deleteProposal(id);
    }
}
