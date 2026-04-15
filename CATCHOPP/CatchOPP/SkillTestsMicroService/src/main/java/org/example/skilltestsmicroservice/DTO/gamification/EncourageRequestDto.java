package org.example.skilltestsmicroservice.Dto.gamification;

import lombok.Data;

@Data
public class EncourageRequestDto {
    private Long fromUserId;
    private Long toUserId;
    private String message;
}
