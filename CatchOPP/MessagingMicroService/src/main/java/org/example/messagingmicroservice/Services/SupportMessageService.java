package org.example.messagingmicroservice.Services;

import org.example.messagingmicroservice.Entities.SupportMessage;
import org.example.messagingmicroservice.Entities.SupportTicket;
import org.example.messagingmicroservice.Repositories.SupportMessageRepository;
import org.example.messagingmicroservice.Repositories.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportMessageService {

    @Autowired
    private SupportMessageRepository supportMessageRepo;

    @Autowired
    private SupportTicketRepository ticketRepo;

    public SupportMessage createSupportMessage(Long ticketId, SupportMessage message) {
        SupportTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found"));

        message.setSupportTicket(ticket);
        return supportMessageRepo.save(message);
    }

    public List<SupportMessage> getMessagesByTicketId(Long ticketId) {
        return supportMessageRepo.findBySupportTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public void deleteSupportMessage(Long id) {
        SupportMessage message = supportMessageRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Support message not found"));
        supportMessageRepo.delete(message);
    }
}
