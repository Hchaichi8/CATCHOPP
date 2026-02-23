package org.example.projectmicroservice.Services;

import org.example.projectmicroservice.Entities.Contract;
import org.example.projectmicroservice.Entities.ContractStatut;
import org.example.projectmicroservice.Entities.Proposal;
import org.example.projectmicroservice.Repositories.ContactRepository;
import org.example.projectmicroservice.Repositories.ProposalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
@Service
public class ContractImpl implements ContractService{
    @Autowired
    private ContactRepository contractRepository;

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

    @Override
    public Contract freelancerSignContract(Long contractId, String signature) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));


        if (contract.getStatus() != ContractStatut.SENT) {
            throw new RuntimeException("Error: You can only sign contracts with status 'SENT'. Current status is: " + contract.getStatus());
        }

        contract.setFreelancerSignature(signature);

        contract.setStatus(ContractStatut.ACTIVE);
        return contractRepository.save(contract);
    }

    @Override
    public Contract freelancerRejectContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStatus(ContractStatut.REJECTED);
        return contractRepository.save(contract);
    }
}
