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
    public Proposal updateProposalStatus(Long proposalId, StatusProposal newStatus) {
        Proposal proposal = proposalRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        proposal.setStatus(newStatus);
        return proposalRepo.save(proposal);
    }
    public Project reactToProject(Long id, String reactionType) {
        Project project = getProjectById(id);

        switch (reactionType.toUpperCase()) {
            case "LIKE": project.setLikes(project.getLikes() + 1); break;
            case "LOVE": project.setLoves(project.getLoves() + 1); break;
            case "HAHA": project.setHahas(project.getHahas() + 1); break;
            case "SUPPORT": project.setSupports(project.getSupports() + 1); break;
        }

        return projectRepo.save(project);
    }
}
