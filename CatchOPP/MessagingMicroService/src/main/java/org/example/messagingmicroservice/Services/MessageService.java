package org.example.messagingmicroservice.Services;

import org.example.messagingmicroservice.Entities.Conversation;
import org.example.messagingmicroservice.Entities.Message;
import org.example.messagingmicroservice.Repositories.ConversationRepository;
import org.example.messagingmicroservice.Repositories.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepo;

    @Autowired
    private ConversationRepository conversationRepo;

    public Message createMessage(Long conversationId, Message message) {
        Conversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        message.setConversation(conversation);
        Message saved = messageRepo.save(message);

        // Update conversation with last message info
        conversation.setLastMessageAt(LocalDateTime.now());
        String preview = message.getContent();
        if (preview != null && preview.length() > 100) {
            preview = preview.substring(0, 100) + "...";
        }
        conversation.setLastMessagePreview(preview);
        conversationRepo.save(conversation);

        return saved;
    }

    public List<Message> getMessagesByConversationId(Long conversationId) {
        return messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public Message updateMessage(Long id, Message updatedMessage) {
        Message existing = messageRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (updatedMessage.getContent() != null) {
            existing.setContent(updatedMessage.getContent());
        }

        return messageRepo.save(existing);
    }

    public void deleteMessage(Long id) {
        Message message = messageRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        messageRepo.delete(message);
    }
}
