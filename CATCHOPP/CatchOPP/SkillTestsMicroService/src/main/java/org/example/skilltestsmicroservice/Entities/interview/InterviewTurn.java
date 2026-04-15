package org.example.skilltestsmicroservice.Entities.interview;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ai_interview_turns")
@Data
public class InterviewTurn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private InterviewSession session;

    private Integer questionIndex;

    @Column(columnDefinition = "TEXT")
    private String aiQuestion;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;
}
