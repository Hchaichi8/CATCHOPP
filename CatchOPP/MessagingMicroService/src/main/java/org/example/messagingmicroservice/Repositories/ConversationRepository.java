package org.example.messagingmicroservice.Repositories;

import org.example.messagingmicroservice.Entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = :userId AND c.deleted = false ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByParticipantsUserId(@Param("userId") Long userId);

    List<Conversation> findByDeletedFalse();
}
