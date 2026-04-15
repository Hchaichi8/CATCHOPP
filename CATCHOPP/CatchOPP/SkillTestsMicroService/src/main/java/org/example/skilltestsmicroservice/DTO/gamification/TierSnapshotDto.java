package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record TierSnapshotDto(
        String tier,
        String displayName,
        long memberCount,
        List<TierLeaderRowDto> topPlayers
) {}
