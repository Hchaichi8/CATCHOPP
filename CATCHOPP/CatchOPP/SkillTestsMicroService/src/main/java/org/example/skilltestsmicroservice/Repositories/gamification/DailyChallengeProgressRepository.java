package org.example.skilltestsmicroservice.Repositories.gamification;

import org.example.skilltestsmicroservice.Entities.gamification.DailyChallengeProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyChallengeProgressRepository extends JpaRepository<DailyChallengeProgress, Long> {

    List<DailyChallengeProgress> findByUserIdAndChallengeDateOrderByIdAsc(Long userId, LocalDate challengeDate);

    Optional<DailyChallengeProgress> findByUserIdAndChallengeDateAndChallengeCode(
            Long userId, LocalDate challengeDate, String challengeCode);
}
