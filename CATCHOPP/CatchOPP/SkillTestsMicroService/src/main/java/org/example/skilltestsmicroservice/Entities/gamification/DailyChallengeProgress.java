package org.example.skilltestsmicroservice.Entities.gamification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "daily_challenge_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "challenge_date", "challenge_code"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyChallengeProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "challenge_date", nullable = false)
    private LocalDate challengeDate;

    @Column(name = "challenge_code", nullable = false, length = 40)
    private String challengeCode;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private int targetCount;

    @Column(nullable = false)
    private int currentCount;

    @Column(nullable = false)
    private int pointsReward;

    @Column(nullable = false)
    private boolean completed;
}
