package tn.esprit.communitymicroservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.communitymicroservice.entities.JoinRequest;
import tn.esprit.communitymicroservice.services.JoinRequestService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/join-requests")
public class JoinRequestController {

    @Autowired
    private JoinRequestService joinRequestService;

    // POST /api/join-requests
    // Body: { "groupId": 1, "userId": 5 }
    @PostMapping
    public ResponseEntity<?> requestJoin(@RequestBody Map<String, Long> body) {
        try {
            Long groupId = body.get("groupId");
            Long userId  = body.get("userId");

            if (groupId == null || userId == null) {
                return ResponseEntity.badRequest().body("groupId and userId are required.");
            }

            JoinRequest request = joinRequestService.requestJoin(groupId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(request);

        } catch (RuntimeException e) {
            // 409 if duplicate pending request
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/join-requests/group/{groupId}
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<JoinRequest>> getAllByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(joinRequestService.getAllByGroup(groupId));
    }

    // GET /api/join-requests/group/{groupId}/pending
    @GetMapping("/group/{groupId}/pending")
    public ResponseEntity<List<JoinRequest>> getPendingByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(joinRequestService.getPendingByGroup(groupId));
    }

    // GET /api/join-requests/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JoinRequest>> getAllByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(joinRequestService.getAllByUser(userId));
    }

    // GET /api/join-requests/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(joinRequestService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/join-requests/{id}/accept
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable Long id) {
        try {
            JoinRequest updated = joinRequestService.acceptRequest(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/join-requests/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        try {
            JoinRequest updated = joinRequestService.rejectRequest(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/join-requests/check?groupId=1&userId=5
    @GetMapping("/check")
    public ResponseEntity<Boolean> check(
            @RequestParam Long groupId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(joinRequestService.hasPendingRequest(groupId, userId));
    }
}
