package org.example.skilltestsmicroservice.Repositories.gamification;

import org.example.skilltestsmicroservice.Entities.gamification.LeagueEncouragement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeagueEncouragementRepository extends JpaRepository<LeagueEncouragement, Long> {

    List<LeagueEncouragement> findByToUserIdOrderByCreatedAtDesc(Long toUserId);

    Page<LeagueEncouragement> findByToUserIdOrderByCreatedAtDesc(Long toUserId, Pageable pageable);

    long countByToUserIdAndCreatedAtAfter(Long toUserId, java.time.LocalDateTime after);
}
