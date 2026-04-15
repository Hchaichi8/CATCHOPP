package org.example.skilltestsmicroservice.Dto.gamification;

public record TierLeaderRowDto(
        long userId,
        int weeklyLeagueXp,
        int rank,
        String displayName,
        String avatarUrl,
        String location,
        int streakDays,
        String leagueTier,
        long followersCount,
        boolean isFollowing,
        int encouragementCountLast7Days,
        int promotionsTotal,
        int demotionsTotal
) {}
