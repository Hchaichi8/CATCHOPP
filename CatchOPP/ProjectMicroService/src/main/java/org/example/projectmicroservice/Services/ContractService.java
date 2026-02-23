package org.example.projectmicroservice.Services;

import org.example.projectmicroservice.Entities.Contract;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ContractService {
    Contract createContract(Contract contract);
    Contract getContractById(Long id);
    List<Contract> getAllContracts();
    List<Contract> getContractsByClient(Long clientId);

    List<Contract> getContractsByFreelancer(Long freelancerId);
    Contract freelancerSignContract(Long contractId, String signature);
    Contract freelancerRejectContract(Long contractId);
}
