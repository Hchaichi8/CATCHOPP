package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record LeaguesOverviewDto(LeagueRulesDto rules, List<TierSnapshotDto> tiers) {}
