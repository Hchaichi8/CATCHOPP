package org.example.skilltestsmicroservice.DTO.interview;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InterviewSessionDto {
    private Long sessionId;
    private String introMessage;
    private String firstQuestion;
    private Integer totalQuestions;
    private Integer currentQuestionIndex;
}
