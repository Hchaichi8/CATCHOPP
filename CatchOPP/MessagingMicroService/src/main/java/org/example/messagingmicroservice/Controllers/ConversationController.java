package org.example.messagingmicroservice.Controllers;

import org.example.messagingmicroservice.Entities.Conversation;
import org.example.messagingmicroservice.Entities.ConversationParticipant;
import org.example.messagingmicroservice.Services.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "*")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping
    public ResponseEntity<Conversation> createConversation(@RequestBody Map<String, Object> payload) {
        Conversation conversation = new Conversation();

        if (payload.containsKey("type")) {
            conversation.setType(org.example.messagingmicroservice.Entities.ConversationType.valueOf((String) payload.get("type")));
        }

        @SuppressWarnings("unchecked")
        List<Long> participantUserIds = null;
        if (payload.containsKey("participantUserIds")) {
            participantUserIds = ((List<Number>) payload.get("participantUserIds"))
                    .stream()
                    .map(Number::longValue)
                    .toList();
        }

        Conversation created = conversationService.createConversation(conversation, participantUserIds);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversationById(@PathVariable Long id) {
        Conversation conversation = conversationService.getConversationById(id);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Conversation>> getConversationsByUserId(@PathVariable Long userId) {
        List<Conversation> conversations = conversationService.getConversationsByUserId(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<ConversationParticipant>> getParticipants(@PathVariable Long id) {
        List<ConversationParticipant> participants = conversationService.getParticipants(id);
        return ResponseEntity.ok(participants);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Conversation> updateConversation(@PathVariable Long id, @RequestBody Conversation conversation) {
        Conversation updated = conversationService.updateConversation(id, conversation);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}
