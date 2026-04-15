package org.example.skilltestsmicroservice.Dto.gamification;

public record AvatarFromPhotoGenerateResponse(
        String avatarUrl,
        boolean aiUsed,
        String engine,
        String note
) {}

