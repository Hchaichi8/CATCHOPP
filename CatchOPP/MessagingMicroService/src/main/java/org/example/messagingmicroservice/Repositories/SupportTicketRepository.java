package org.example.messagingmicroservice.Repositories;

import org.example.messagingmicroservice.Entities.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByCreatedByAndDeletedFalse(Long createdBy);

    List<SupportTicket> findByDeletedFalse();
}
