package org.example.messagingmicroservice.Controllers;

import org.example.messagingmicroservice.Entities.SupportMessage;
import org.example.messagingmicroservice.Services.SupportMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support/messages")
@CrossOrigin(origins = "*")
public class SupportMessageController {

    @Autowired
    private SupportMessageService supportMessageService;

    @PostMapping
    public ResponseEntity<SupportMessage> createSupportMessage(@RequestBody Map<String, Object> payload) {
        Long ticketId = ((Number) payload.get("ticketId")).longValue();

        SupportMessage message = new SupportMessage();
        message.setSenderId(((Number) payload.get("senderId")).longValue());
        message.setContent((String) payload.get("content"));

        SupportMessage created = supportMessageService.createSupportMessage(ticketId, message);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<SupportMessage>> getMessagesByTicketId(@PathVariable Long ticketId) {
        List<SupportMessage> messages = supportMessageService.getMessagesByTicketId(ticketId);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupportMessage(@PathVariable Long id) {
        supportMessageService.deleteSupportMessage(id);
        return ResponseEntity.noContent().build();
    }
}
