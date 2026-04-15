package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record GamificationDashboardDto(
        Long userId,
        int totalPoints,
        String leagueTier,
        int weeklyLeagueXp,
        String leagueWeekStartMonday,
        boolean activeSubscriber,
        List<String> badges,
        List<DailyChallengeViewDto> dailyChallenges,
        String nextLeagueReset,
        Integer rankInTier,
        Long playersInTier,
        List<LeagueBoardRowDto> leagueTopPlayers
) {
    public record DailyChallengeViewDto(
            Long id,
            String code,
            String title,
            int targetCount,
            int currentCount,
            int pointsReward,
            boolean completed
    ) {}

    public record LeagueBoardRowDto(
            long userId,
            int weeklyLeagueXp,
            String displayName,
            String avatarUrl,
            String location,
            int streakDays,
            long followersCount,
            boolean isFollowing
    ) {}
}
