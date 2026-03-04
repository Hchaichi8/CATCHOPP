package org.example.mscommunication;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload Message chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());

        // 1. Sauvegarde du message en base de données
        Message savedMsg = messageRepository.save(chatMessage);

        conversationRepository.findById(chatMessage.getConversationId()).ifPresent(conv -> {
            conv.setLastMessageTime(LocalDateTime.now());
            conversationRepository.save(conv);
        });

        // 2. Envoyer au destinataire
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getRecipientId()),
                "/queue/messages",
                savedMsg
        );

        // 3. Renvoyer à l'expéditeur (pour que l'UI récupère l'ID généré par la DB !)
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getSenderId()),
                "/queue/messages",
                savedMsg
        );
    }

    // =======================================================
    // ✏️ UPDATE MESSAGE
    // =======================================================
    @PutMapping("/messages/{id}")
    public ResponseEntity<?> updateMessage(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Message> optionalMsg = messageRepository.findById(id);
        if(optionalMsg.isPresent()){
            Message msg = optionalMsg.get();
            msg.setContent(payload.get("content"));
            Message updatedMsg = messageRepository.save(msg);

            // Notifier les deux utilisateurs de la mise à jour
            messagingTemplate.convertAndSendToUser(String.valueOf(msg.getRecipientId()), "/queue/updates", updatedMsg);
            messagingTemplate.convertAndSendToUser(String.valueOf(msg.getSenderId()), "/queue/updates", updatedMsg);

            return ResponseEntity.ok(updatedMsg);
        }
        return ResponseEntity.notFound().build();
    }

    // =======================================================
    // 🗑️ DELETE MESSAGE
    // =======================================================
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        Optional<Message> optionalMsg = messageRepository.findById(id);
        if(optionalMsg.isPresent()){
            Message msg = optionalMsg.get();
            messageRepository.deleteById(id);

            // Notifier les deux utilisateurs de la suppression
            Map<String, Object> deletePayload = Map.of(
                    "deletedId", id,
                    "conversationId", msg.getConversationId()
            );

            messagingTemplate.convertAndSendToUser(String.valueOf(msg.getRecipientId()), "/queue/deletes", deletePayload);
            messagingTemplate.convertAndSendToUser(String.valueOf(msg.getSenderId()), "/queue/deletes", deletePayload);

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // =======================================================
    // 📥 PARTIE CLASSIQUE (API REST pour l'historique)
    // =======================================================

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Conversation>> getUserConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(conversationRepository.findConversationsByUserId(userId));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(messageRepository.findByConversationIdOrderByTimestampAsc(conversationId));
    }

    @PostMapping("/conversation/create")
    public ResponseEntity<Conversation> getOrCreateConversation(@RequestParam Long user1, @RequestParam Long user2) {
        Conversation conv = conversationRepository.findByParticipants(user1, user2)
                .orElseGet(() -> conversationRepository.save(new Conversation(user1, user2)));
        return ResponseEntity.ok(conv);
    }
}