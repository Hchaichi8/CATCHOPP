package org.example.projectmicroservice.Controllers;


import org.example.projectmicroservice.Entities.Contract;
import org.example.projectmicroservice.Services.ContractImpl;
import org.example.projectmicroservice.Services.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/Contract")
public class ContractController {

    @Autowired
    private ContractImpl contractService;

    @PostMapping("/generate-from-proposal/{proposalId}")
    public ResponseEntity<?> generateContract(
            @PathVariable Long proposalId,
            @RequestBody Map<String, Object> requestData
    ) {
        try {
            String terms = (String) requestData.get("terms");
            String clientName = (String) requestData.get("clientName");

            String clientSignature = (String) requestData.get("clientSignature");

            Long clientId = Long.valueOf(requestData.get("clientId").toString());
            LocalDate startDate = LocalDate.parse((String) requestData.get("startDate"));

            Contract newContract = contractService.generateContractFromProposal(
                    proposalId, terms, clientId, clientName, startDate, clientSignature
            );

            return ResponseEntity.ok(newContract);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Contract>> getClientContracts(@PathVariable Long clientId) {
        List<Contract> contracts = contractService.getContractsByClient(clientId);
        return ResponseEntity.ok(contracts);
    }

    @PostMapping("/create")
    public ResponseEntity<Contract> createContract(@RequestBody Contract contract) {
        Contract newContract = contractService.createContract(contract);
        return new ResponseEntity<>(newContract, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contract> getContractById(@PathVariable Long id) {
        Contract contract = contractService.getContractById(id);
        return new ResponseEntity<>(contract, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Contract>> getAllContracts() {
        List<Contract> contracts = contractService.getAllContracts();
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }
    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<Contract>> getFreelancerContracts(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(contractService.getContractsByFreelancer(freelancerId));
    }

    @PutMapping("/{contractId}/sign")
    public ResponseEntity<Contract> signContract(
            @PathVariable Long contractId,
            @RequestBody Map<String, String> payload
    ) {
        String signature = payload.get("signature");
        return ResponseEntity.ok(contractService.freelancerSignContract(contractId, signature));
    }

    @PutMapping("/{contractId}/reject")
    public ResponseEntity<Contract> rejectContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.freelancerRejectContract(contractId));
    }
}

