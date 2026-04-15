package org.example.skilltestsmicroservice.Dto.gamification;

import lombok.Data;

@Data
public class AvatarFromPhotoGenerateRequest {
    private String imageBase64;
    private String mimeType;
    /** 0..100 (low = closer to real features, high = more cartoon exaggeration). */
    private Integer styleIntensity;
    /** auto | male | female | neutral */
    private String genderPreference;
}

