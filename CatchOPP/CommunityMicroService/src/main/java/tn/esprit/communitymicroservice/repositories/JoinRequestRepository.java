package tn.esprit.communitymicroservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.communitymicroservice.entities.JoinRequest;
import tn.esprit.communitymicroservice.entities.JoinRequestStatus;

import java.util.List;
import java.util.Optional;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {

    // All requests for a group
    List<JoinRequest> findByGroupId(Long groupId);

    // Pending requests for a group
    List<JoinRequest> findByGroupIdAndStatus(Long groupId, JoinRequestStatus status);

    // All requests from a user
    List<JoinRequest> findByUserId(Long userId);

    // Check if a pending request already exists
    Optional<JoinRequest> findByGroupIdAndUserId(Long groupId, Long userId);

    // Check existence by group, user and status
    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, JoinRequestStatus status);
}
