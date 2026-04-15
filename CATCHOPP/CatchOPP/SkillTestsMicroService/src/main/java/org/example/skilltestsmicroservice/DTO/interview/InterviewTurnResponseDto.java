package org.example.skilltestsmicroservice.DTO.interview;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InterviewTurnResponseDto {
    private Long sessionId;
    private Integer questionIndex;
    private String nextQuestion;
    private String feedback;
    private Boolean finished;
    private Integer finalScore;
}
