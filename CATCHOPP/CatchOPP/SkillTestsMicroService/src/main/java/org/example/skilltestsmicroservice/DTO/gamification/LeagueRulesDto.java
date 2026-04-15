package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record LeagueRulesDto(
        String summary,
        int promoteTopCount,
        int demoteBottomCount,
        boolean mustHavePositiveWeeklyXpToPromote,
        String resetScheduleHuman,
        String howPromotionWorks,
        String howDemotionWorks,
        List<LeaguePrizeInfoDto> weeklyTopPrizes
) {}
