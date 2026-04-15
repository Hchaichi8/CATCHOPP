package org.example.skilltestsmicroservice.Dto.gamification;

import java.util.List;

public record EncouragementPageDto(
        List<EncouragementViewDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
