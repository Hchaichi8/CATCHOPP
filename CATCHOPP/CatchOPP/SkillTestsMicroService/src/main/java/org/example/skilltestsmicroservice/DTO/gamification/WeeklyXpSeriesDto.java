package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record WeeklyXpSeriesDto(
        long profileUserId,
        String profileDisplayName,
        List<String> labels,
        List<Integer> profileXpSeries,
        Long comparisonUserId,
        String comparisonDisplayName,
        List<Integer> comparisonXpSeries
) {}

