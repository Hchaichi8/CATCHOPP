package org.example.usermicroservice.Dto;

import lombok.Data;

@Data
public class CreateInAppNotificationRequest {
    private Long userId;
    private String type;
    private String title;
    private String body;
    private String link;
    private String dedupeKey;
}
