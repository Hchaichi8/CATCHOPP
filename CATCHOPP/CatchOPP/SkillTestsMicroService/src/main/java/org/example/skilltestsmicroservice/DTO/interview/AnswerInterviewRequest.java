package org.example.skilltestsmicroservice.DTO.interview;

import lombok.Data;

@Data
public class AnswerInterviewRequest {
    private Long sessionId;
    private String answer;
}
