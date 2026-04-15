package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record LeaguePublicProfileDto(
        long userId,
        String displayName,
        String avatarUrl,
        String location,
        int streakDays,
        String leagueTier,
        int weeklyLeagueXp,
        int totalPoints,
        long followersCount,
        long followingCount,
        int promotionsTotal,
        int demotionsTotal,
        List<EncouragementViewDto> recentEncouragements,
        boolean viewerIsFollowing
) {}
