package org.example.mscommunication;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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

        // Mettre à jour l'heure de la conversation pour qu'elle remonte en haut de la liste
        conversationRepository.findById(chatMessage.getConversationId()).ifPresent(conv -> {
            conv.setLastMessageTime(LocalDateTime.now());
            conversationRepository.save(conv);
        });

        // 2. 🟢 LA MAGIE : On pousse le message directement sur l'écran du destinataire !
        // Le destinataire écoutera sur : /user/{son_id}/queue/messages
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getRecipientId()),
                "/queue/messages",
                savedMsg
        );
    }

    // =======================================================
    // 📥 PARTIE CLASSIQUE (API REST pour l'historique)
    // =======================================================

    // Obtenir toutes les conversations d'un utilisateur (pour la barre latérale)
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Conversation>> getUserConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(conversationRepository.findConversationsByUserId(userId));
    }

    // Obtenir l'historique des messages d'une conversation précise
    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(messageRepository.findByConversationIdOrderByTimestampAsc(conversationId));
    }

    // Créer une conversation si elle n'existe pas (Quand on clique sur "Contacter" sur un profil)
    @PostMapping("/conversation/create")
    public ResponseEntity<Conversation> getOrCreateConversation(@RequestParam Long user1, @RequestParam Long user2) {
        Conversation conv = conversationRepository.findByParticipants(user1, user2)
                .orElseGet(() -> conversationRepository.save(new Conversation(user1, user2)));
        return ResponseEntity.ok(conv);
    }
}
