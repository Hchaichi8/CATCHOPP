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

    public Project updateProject(Long id, Project updates) {
        Project existing = getProjectById(id);
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getBudget() != null) existing.setBudget(updates.getBudget());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getClientId() != null) existing.setClientId(updates.getClientId());
        return projectRepo.save(existing);
    }

    public void deleteProject(Long id) {
        projectRepo.deleteById(id);
    }

    public Proposal getProposalById(Long id) {
        return proposalRepo.findById(id).orElseThrow(() -> new RuntimeException("Proposal not found"));
    }

    public Proposal updateProposal(Long id, Proposal updates) {
        Proposal existing = getProposalById(id);
        if (updates.getBidAmount() != null) existing.setBidAmount(updates.getBidAmount());
        if (updates.getEstimationEndDate() != null) existing.setEstimationEndDate(updates.getEstimationEndDate());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getFreelancerId() != null) existing.setFreelancerId(updates.getFreelancerId());
        return proposalRepo.save(existing);
    }

    public void deleteProposal(Long id) {
        proposalRepo.deleteById(id);
    }

    public List<Proposal> getAllProposals() {
        return proposalRepo.findAll();
    }
}
