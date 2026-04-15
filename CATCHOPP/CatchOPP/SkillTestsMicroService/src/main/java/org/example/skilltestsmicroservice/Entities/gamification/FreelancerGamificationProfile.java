package org.example.skilltestsmicroservice.Entities.gamification;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "freelancer_gamification_profiles", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreelancerGamificationProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private int totalPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeagueTier leagueTier;

    /** XP counted for this week's league leaderboard & promotions. */
    @Column(nullable = false)
    private int weeklyLeagueXp;

    /** Monday date (UTC) when the current league week started. */
    @Column(nullable = false)
    private LocalDate leagueWeekStartMonday;

    @Column(name = "last_subscriber_boost_week")
    private LocalDate lastSubscriberBoostWeek;

    /** Synced from Angular when user has an active paid subscription — bonus XP on challenges. */
    @Column(name = "active_subscriber")
    private Boolean activeSubscriber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "gamification_user_badges", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "badge_code")
    @Builder.Default
    private Set<String> badges = new HashSet<>();

    @Column(name = "display_name", length = 120)
    private String displayName;

    @Column(name = "avatar_url", length = 2000)
    private String avatarUrl;

    @Column(name = "location", length = 120)
    private String location;

    @Column(name = "streak_days", nullable = false)
    @Builder.Default
    private int streakDays = 0;

    @Column(name = "last_streak_activity")
    private LocalDate lastStreakActivityDate;

    @Column(name = "promotions_total", nullable = false)
    @Builder.Default
    private int promotionsTotal = 0;

    @Column(name = "demotions_total", nullable = false)
    @Builder.Default
    private int demotionsTotal = 0;
}
