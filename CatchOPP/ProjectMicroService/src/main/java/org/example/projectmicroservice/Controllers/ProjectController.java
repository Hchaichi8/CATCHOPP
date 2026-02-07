package org.example.projectmicroservice.Controllers;

import org.example.projectmicroservice.Entities.Project;
import org.example.projectmicroservice.Entities.Proposal;
import org.example.projectmicroservice.Entities.StatusProposal;
import org.example.projectmicroservice.Services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
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
}
