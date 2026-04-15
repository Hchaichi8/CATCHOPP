package org.example.projectmicroservice.Services;

import jakarta.transaction.Transactional;
import org.example.projectmicroservice.Entities.*;
import org.example.projectmicroservice.OpenFeign.PaymentClient;
import org.example.projectmicroservice.Repositories.ContactRepository;
import org.example.projectmicroservice.Repositories.ProjectRepository;
import org.example.projectmicroservice.Repositories.ProposalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;


import java.time.LocalDate;
import java.util.List;
import org.example.projectmicroservice.DTO.EscrowRequest;

@Service
public class ContractImpl implements ContractService{
    @Autowired
    private ContactRepository contractRepository;
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProposalRepository proposalRepository;

    public Contract generateContractFromProposal(Long proposalId, String terms, Long clientId, String clientName, LocalDate startDate ,String clientSignature) {

        System.out.println(">>> Génération du contrat pour Proposal ID: " + proposalId);

        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        Contract contract = new Contract();

        contract.setProposal(proposal);
        contract.setFreelancerId(proposal.getFreelancerId());
        contract.setRate(proposal.getBidAmount());
        contract.setDeadline(proposal.getEstimationEndDate());

        if (proposal.getProject() != null) {
            contract.setProjectId(proposal.getProject().getId());
            contract.setProjectTitle(proposal.getProject().getTitle());
        } else {
            contract.setProjectId(0L);
            contract.setProjectTitle("Projet Inconnu");
        }

        contract.setClientId(clientId);
        contract.setClientName(clientName);
        contract.setTerms(terms);
        contract.setStartDate(startDate);
        contract.setStatus(ContractStatut.SENT);
        contract.setClientSignature(clientSignature);

        return contractRepository.save(contract);
    }

    @Override
    public List<Contract> getContractsByClient(Long clientId) {
        return contractRepository.findByClientId(clientId);
    }

    @Override
    public Contract createContract(Contract contract) {
        return contractRepository.save(contract);
    }

    @Override
    public Contract getContractById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));
    }

    @Override
    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }

    @Override
    public List<Contract> getContractsByFreelancer(Long freelancerId) {
        return contractRepository.findByFreelancerId(freelancerId);
    }

    @Transactional
    public void completeContractAndProject(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // 1. Update Contract Status
        contract.setStatus(ContractStatut.COMPLETED);
        contractRepository.save(contract);

        // 2. Update Project Status
        Project project = projectRepository.findById(contract.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus(Status.CLOSED);
        projectRepository.save(project);
    }

    @Autowired
    private PaymentClient paymentClient;

    @Transactional
    @Override
    public Contract freelancerSignContract(Long contractId, String signature, String freelancerName) {
        System.out.println("[PROJECT-MS] PROCESSING SIGNATURE FOR CONTRACT: " + contractId);

        // 1. Fetch the existing contract
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found with ID: " + contractId));

        // 2. Security/Status Check
        if (contract.getStatus() != ContractStatut.SENT) {
            throw new RuntimeException("This contract is not in a signable state (Status: " + contract.getStatus() + ")");
        }

        // 3. Update the fields
        contract.setFreelancerSignature(signature);
        contract.setFreelancerName(freelancerName); // <-- THE FIX: Saving the name to DB
        contract.setStatus(ContractStatut.ACTIVE);

        // Save early to ensure IDs are ready for the payment call
        Contract savedContract = contractRepository.save(contract);

        // 4. Trigger the Payment/Escrow Microservice
        try {
            EscrowRequest paymentData = new EscrowRequest(
                    savedContract.getId(),
                    savedContract.getClientId(),
                    savedContract.getFreelancerId(),
                    new BigDecimal(savedContract.getRate().toString())
            );

            System.out.println("[PROJECT-MS] LOCKING ESCROW FOR CLIENT: " + savedContract.getClientId());
            paymentClient.lockEscrow(paymentData);

        } catch (Exception e) {
            System.err.println("[PROJECT-MS] PAIEMENT-MS CONNECTION ERROR: " + e.getMessage());
            // We throw an exception here so @Transactional rolls back the signature if payment fails
            throw new RuntimeException("Contract signature failed because escrow could not be locked: " + e.getMessage());
        }

        return savedContract;
    }


    @Override
    public Contract freelancerRejectContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStatus(ContractStatut.REJECTED);
        return contractRepository.save(contract);
    }
}
