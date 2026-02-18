package org.example.messagingmicroservice.Services;

import org.example.messagingmicroservice.Entities.Conversation;
import org.example.messagingmicroservice.Entities.ConversationParticipant;
import org.example.messagingmicroservice.Repositories.ConversationParticipantRepository;
import org.example.messagingmicroservice.Repositories.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepo;

    @Autowired
    private ConversationParticipantRepository participantRepo;

    public Conversation createConversation(Conversation conversation, List<Long> participantUserIds) {
        Conversation saved = conversationRepo.save(conversation);

        if (participantUserIds != null) {
            for (Long userId : participantUserIds) {
                ConversationParticipant participant = new ConversationParticipant();
                participant.setUserId(userId);
                participant.setConversation(saved);
                participantRepo.save(participant);
            }
        }

        return saved;
    }

    public Conversation getConversationById(Long id) {
        return conversationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
    }

    public List<Conversation> getConversationsByUserId(Long userId) {
        return conversationRepo.findByParticipantsUserId(userId);
    }

    public Conversation updateConversation(Long id, Conversation updatedConversation) {
        Conversation existing = getConversationById(id);
        if (updatedConversation.getType() != null) {
            existing.setType(updatedConversation.getType());
        }
        if (updatedConversation.getLastMessagePreview() != null) {
            existing.setLastMessagePreview(updatedConversation.getLastMessagePreview());
        }
        return conversationRepo.save(existing);
    }

    public void deleteConversation(Long id) {
        Conversation conversation = getConversationById(id);
        conversation.setDeleted(true);
        conversationRepo.save(conversation);
    }

    public List<ConversationParticipant> getParticipants(Long conversationId) {
        return participantRepo.findByConversationId(conversationId);
    }
}
