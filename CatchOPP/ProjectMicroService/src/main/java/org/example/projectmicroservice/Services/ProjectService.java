package org.example.projectmicroservice.Services;


import org.example.projectmicroservice.Entities.*;
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

    public void deleteProject(Long id) {
        if (!projectRepo.existsById(id)) {
            throw new RuntimeException("Projet introuvable");
        }
        projectRepo.deleteById(id);
    }


    public Project updateProjectStatus(Long id, Status status) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        project.setStatus(status);
        return projectRepo.save(project);
    }


    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setBudget(projectDetails.getBudget());
        project.setCategory(projectDetails.getCategory());
        project.setExperienceLevel(projectDetails.getExperienceLevel());
        project.setJobType(projectDetails.getJobType());


        if (projectDetails.getImage() != null) {
            project.setImage(projectDetails.getImage());
        }

        return projectRepo.save(project);
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
    public Proposal getProposalById(Long proposalId) {
        return proposalRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found with ID: " + proposalId));
    }
}
