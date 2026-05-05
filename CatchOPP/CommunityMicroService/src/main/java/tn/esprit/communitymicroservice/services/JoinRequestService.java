package tn.esprit.communitymicroservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.communitymicroservice.entities.*;
import tn.esprit.communitymicroservice.repositories.GroupMemberRepository;
import tn.esprit.communitymicroservice.repositories.GroupRepository;
import tn.esprit.communitymicroservice.repositories.JoinRequestRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class JoinRequestService {

    @Autowired
    private JoinRequestRepository joinRequestRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    // ── Submit a join request ─────────────────────────────────────────────
    public JoinRequest requestJoin(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));

        // Only INVITE_ONLY groups require a request
        if (group.getType() != GroupType.INVITE_ONLY) {
            throw new RuntimeException("Group is not invitation-only. Join directly.");
        }

        // Reject duplicate pending request
        if (joinRequestRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, JoinRequestStatus.PENDING)) {
            throw new RuntimeException("A pending request already exists for this user and group.");
        }

        JoinRequest request = new JoinRequest();
        request.setGroup(group);
        request.setUserId(userId);
        request.setStatus(JoinRequestStatus.PENDING);
        return joinRequestRepository.save(request);
    }

    // ── Get all requests for a group ──────────────────────────────────────
    public List<JoinRequest> getAllByGroup(Long groupId) {
        return joinRequestRepository.findByGroupId(groupId);
    }

    // ── Get pending requests for a group ──────────────────────────────────
    public List<JoinRequest> getPendingByGroup(Long groupId) {
        return joinRequestRepository.findByGroupIdAndStatus(groupId, JoinRequestStatus.PENDING);
    }

    // ── Get all requests from a user ──────────────────────────────────────
    public List<JoinRequest> getAllByUser(Long userId) {
        return joinRequestRepository.findByUserId(userId);
    }

    // ── Accept a request → add user as member ────────────────────────────
    public JoinRequest acceptRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));

        if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw new RuntimeException("Request is already processed.");
        }

        request.setStatus(JoinRequestStatus.ACCEPTED);
        request.setProcessedAt(LocalDateTime.now());
        joinRequestRepository.save(request);

        // Auto-add as group member
        GroupMember member = new GroupMember();
        member.setGroup(request.getGroup());
        member.setUserId(request.getUserId());
        member.setRole(Role.MEMBER);
        member.setJoinedAt(LocalDateTime.now());
        groupMemberRepository.save(member);

        return request;
    }

    // ── Reject a request ──────────────────────────────────────────────────
    public JoinRequest rejectRequest(Long requestId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));

        if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw new RuntimeException("Request is already processed.");
        }

        request.setStatus(JoinRequestStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());
        return joinRequestRepository.save(request);
    }

    // ── Check if a pending request exists ────────────────────────────────
    public boolean hasPendingRequest(Long groupId, Long userId) {
        return joinRequestRepository.existsByGroupIdAndUserIdAndStatus(
                groupId, userId, JoinRequestStatus.PENDING);
    }

    // ── Get request by ID ─────────────────────────────────────────────────
    public JoinRequest getById(Long id) {
        return joinRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found: " + id));
    }
}
