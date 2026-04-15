package org.example.skilltestsmicroservice.Repositories.gamification;

import org.example.skilltestsmicroservice.Entities.gamification.FreelancerGamificationProfile;
import org.example.skilltestsmicroservice.Entities.gamification.LeagueTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreelancerGamificationProfileRepository extends JpaRepository<FreelancerGamificationProfile, Long> {

    Optional<FreelancerGamificationProfile> findByUserId(Long userId);

    List<FreelancerGamificationProfile> findByLeagueTierOrderByWeeklyLeagueXpDesc(LeagueTier tier);

    long countByLeagueTier(LeagueTier tier);

    long countByLeagueTierAndWeeklyLeagueXpGreaterThan(LeagueTier tier, int weeklyLeagueXp);
}
