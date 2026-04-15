package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record EncouragementViewDto(
        long id,
        long fromUserId,
        String fromDisplayName,
        String message,
        String createdAt,
        List<ReactionCountDto> reactions,
        String viewerReaction
) {}
