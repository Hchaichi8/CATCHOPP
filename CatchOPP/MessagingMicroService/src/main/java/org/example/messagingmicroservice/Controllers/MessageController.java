package org.example.messagingmicroservice.Controllers;

import org.example.messagingmicroservice.Entities.Message;
import org.example.messagingmicroservice.Services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<Message> createMessage(@RequestBody Map<String, Object> payload) {
        Long conversationId = ((Number) payload.get("conversationId")).longValue();

        Message message = new Message();
        message.setSenderId(((Number) payload.get("senderId")).longValue());
        message.setContent((String) payload.get("content"));

        Message created = messageService.createMessage(conversationId, message);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<List<Message>> getMessagesByConversationId(@PathVariable Long conversationId) {
        List<Message> messages = messageService.getMessagesByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @RequestBody Message message) {
        Message updated = messageService.updateMessage(id, message);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
