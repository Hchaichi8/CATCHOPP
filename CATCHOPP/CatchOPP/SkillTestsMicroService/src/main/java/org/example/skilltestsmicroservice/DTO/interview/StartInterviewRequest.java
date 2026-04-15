package org.example.skilltestsmicroservice.DTO.interview;

import lombok.Data;

import java.util.List;

@Data
public class StartInterviewRequest {
    private Long userId;
    private Long projectId;
    private String projectTitle;
    private String role;
    private List<String> skills;
    private String language;
}
