package org.example.skilltestsmicroservice.Dto.gamification;

import lombok.Data;

@Data
public class UpdatePublicProfileDto {
    private String displayName;
    private String avatarUrl;
    private String location;
}
