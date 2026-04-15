package org.example.skilltestsmicroservice.Repositories.gamification;

import org.example.skilltestsmicroservice.Entities.gamification.LeagueXpDailyStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueXpDailyStatRepository extends JpaRepository<LeagueXpDailyStat, Long> {

    Optional<LeagueXpDailyStat> findByUserIdAndStatDate(Long userId, LocalDate statDate);

    List<LeagueXpDailyStat> findByUserIdAndStatDateBetweenOrderByStatDateAsc(Long userId, LocalDate start, LocalDate end);
}

