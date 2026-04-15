package org.example.usermicroservice.Repositories;

import org.example.usermicroservice.Entities.InAppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, Long> {

    List<InAppNotification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<InAppNotification> findByDedupeKey(String dedupeKey);

    long countByUserIdAndReadFlagFalse(Long userId);
}
