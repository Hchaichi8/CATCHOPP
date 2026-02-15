package org.example.projectmicroservice.Controllers;

import org.example.projectmicroservice.Entities.Project;
import org.example.projectmicroservice.Entities.Proposal;
import org.example.projectmicroservice.Entities.StatusProposal;
import org.example.projectmicroservice.Services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
@RequestMapping("/Project")
public class ProjectController {

    @Autowired
    private ProjectService service;

    @PostMapping("/newproject")
    public Project createProject(@RequestBody Project project) {
        return service.createProject(project);
    }

    @GetMapping("/allprojects")
    public List<Project> getAllProjects() {
        return service.getAllProjects();
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return service.getProjectById(id);
    }

    @PutMapping("/{projectId}/react")
    public Project reactToProject(@PathVariable Long projectId, @RequestParam String type) {
        return service.reactToProject(projectId, type);
    }

    @PostMapping("/{projectId}/proposals")
    public Proposal submitProposal(@PathVariable Long projectId, @RequestBody Proposal proposal) {
        return service.createProposal(projectId, proposal);
    }


    @GetMapping("/{projectId}/proposals")
    public List<Proposal> getProposals(@PathVariable Long projectId) {
        return service.getProposalsForProject(projectId);
    }
    @PutMapping("/proposals/{proposalId}/status")
    public Proposal updateStatus(@PathVariable Long proposalId, @RequestParam StatusProposal status) {
        return service.updateProposalStatus(proposalId, status);
    }
}
