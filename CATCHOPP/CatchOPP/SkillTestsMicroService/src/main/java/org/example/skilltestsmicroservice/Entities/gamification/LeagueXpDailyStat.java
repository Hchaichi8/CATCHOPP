package org.example.skilltestsmicroservice.Entities.gamification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "league_xp_daily_stats",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "stat_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeagueXpDailyStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;

    @Column(name = "league_xp_earned", nullable = false)
    private int leagueXpEarned;
}

