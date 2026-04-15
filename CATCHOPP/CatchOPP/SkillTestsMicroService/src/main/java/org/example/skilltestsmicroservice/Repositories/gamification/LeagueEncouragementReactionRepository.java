package org.example.skilltestsmicroservice.Repositories.gamification;

import org.example.skilltestsmicroservice.Entities.gamification.LeagueEncouragementReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueEncouragementReactionRepository extends JpaRepository<LeagueEncouragementReaction, Long> {

    List<LeagueEncouragementReaction> findByEncouragementIdIn(Collection<Long> encouragementIds);

    Optional<LeagueEncouragementReaction> findByEncouragementIdAndUserId(Long encouragementId, Long userId);

    void deleteByEncouragementIdAndUserId(Long encouragementId, Long userId);

    void deleteByEncouragementId(Long encouragementId);
}
