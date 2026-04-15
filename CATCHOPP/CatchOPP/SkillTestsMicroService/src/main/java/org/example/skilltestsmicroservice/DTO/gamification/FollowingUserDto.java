package org.example.skilltestsmicroservice.Dto.gamification;

public record FollowingUserDto(
        long userId,
        String displayName,
        String avatarUrl,
        String leagueTier,
        int weeklyLeagueXp,
        int streakDays,
        int totalPoints
) {}
