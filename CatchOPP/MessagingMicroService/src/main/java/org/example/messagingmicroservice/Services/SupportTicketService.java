package org.example.messagingmicroservice.Services;

import org.example.messagingmicroservice.Entities.SupportTicket;
import org.example.messagingmicroservice.Repositories.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportTicketService {

    @Autowired
    private SupportTicketRepository ticketRepo;

    public SupportTicket createTicket(SupportTicket ticket) {
        return ticketRepo.save(ticket);
    }

    public SupportTicket getTicketById(Long id) {
        return ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Support ticket not found"));
    }

    public List<SupportTicket> getTicketsByUserId(Long userId) {
        return ticketRepo.findByCreatedByAndDeletedFalse(userId);
    }

    public SupportTicket updateTicket(Long id, SupportTicket updatedTicket) {
        SupportTicket existing = getTicketById(id);

        if (updatedTicket.getSubject() != null) {
            existing.setSubject(updatedTicket.getSubject());
        }
        if (updatedTicket.getDescription() != null) {
            existing.setDescription(updatedTicket.getDescription());
        }
        if (updatedTicket.getStatus() != null) {
            existing.setStatus(updatedTicket.getStatus());
        }
        if (updatedTicket.getPriority() != null) {
            existing.setPriority(updatedTicket.getPriority());
        }

        return ticketRepo.save(existing);
    }

    public void deleteTicket(Long id) {
        SupportTicket ticket = getTicketById(id);
        ticket.setDeleted(true);
        ticketRepo.save(ticket);
    }
}
