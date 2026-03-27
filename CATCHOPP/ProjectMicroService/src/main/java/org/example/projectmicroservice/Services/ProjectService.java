package org.example.projectmicroservice.Services;


import org.example.projectmicroservice.Entities.Project;
import org.example.projectmicroservice.Entities.Proposal;
import org.example.projectmicroservice.Entities.StatusProposal;
import org.example.projectmicroservice.Repositories.ProjectRepository;
import org.example.projectmicroservice.Repositories.ProposalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private ProposalRepository proposalRepo;

    // --- Project Methods ---
    public Project createProject(Project project) {
        return projectRepo.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepo.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    // --- Proposal Methods ---
    public Proposal createProposal(Long projectId, Proposal proposal) {
        Project project = getProjectById(projectId);
        proposal.setProject(project);
        return proposalRepo.save(proposal);
    }

    public List<Proposal> getProposalsForProject(Long projectId) {
        return proposalRepo.findByProjectId(projectId);
    }

    // Change le type de String -> StatusProposal
    public Proposal updateProposalStatus(Long proposalId, StatusProposal newStatus) {
        Proposal proposal = proposalRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        proposal.setStatus(newStatus);
        return proposalRepo.save(proposal);
    }
}
