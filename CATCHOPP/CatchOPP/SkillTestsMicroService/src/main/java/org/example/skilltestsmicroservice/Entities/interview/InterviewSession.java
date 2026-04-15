package org.example.skilltestsmicroservice.Entities.interview;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_interview_sessions")
@Data
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long projectId;

    private String projectTitle;
    private String role;

    @Column(length = 1000)
    private String targetSkills;

    @Enumerated(EnumType.STRING)
    private InterviewSessionStatus status = InterviewSessionStatus.IN_PROGRESS;

    private Integer totalQuestions;
    private Integer currentIndex = 0;
    private Integer score;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionIndex asc")
    private List<InterviewTurn> turns = new ArrayList<>();
}
