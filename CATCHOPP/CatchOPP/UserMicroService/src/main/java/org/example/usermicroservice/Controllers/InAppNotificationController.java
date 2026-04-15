package org.example.usermicroservice.Controllers;

import org.example.usermicroservice.Dto.CreateInAppNotificationRequest;
import org.example.usermicroservice.Entities.InAppNotification;
import org.example.usermicroservice.Services.InAppNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/User/notifications")
@CrossOrigin(origins = "*")
public class InAppNotificationController {

    @Autowired
    private InAppNotificationService notificationService;

    /** Browser-friendly index; inbox JSON is at /user/{userId}. */
    @GetMapping
    public Map<String, String> index() {
        return Map.of(
                "ui",
                "Notification inbox UI: open Angular app http://localhost:4200/Notifications (this port is JSON API only).",
                "inbox", "GET /User/notifications/user/{userId}",
                "unreadCount", "GET /User/notifications/user/{userId}/unread-count",
                "markRead", "PATCH /User/notifications/{id}/read?userId=",
                "markAllRead", "PATCH /User/notifications/user/{userId}/read-all",
                "createInternal", "POST /User/notifications/internal (service-to-service)"
        );
    }

    @GetMapping("/user/{userId}")
    public List<InAppNotification> list(@PathVariable Long userId) {
        return notificationService.listForUser(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Map<String, Long> unreadCount(@PathVariable Long userId) {
        return Map.of("count", notificationService.unreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(notificationService.markRead(id, userId));
        } catch (RuntimeException e) {
            if ("Forbidden".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/internal")
    public ResponseEntity<InAppNotification> createInternal(@RequestBody CreateInAppNotificationRequest body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.createInternal(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** Local/demo: create one sample per type for this user (idempotent via dedupe keys). */
    @PostMapping("/seed/{userId}")
    public ResponseEntity<Map<String, Integer>> seedDemo(@PathVariable Long userId) {
        int created = notificationService.seedDemoNotifications(userId);
        return ResponseEntity.ok(Map.of("created", created));
    }
}
